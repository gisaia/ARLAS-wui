import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditModeEnum, EditResultlistColumnsComponent, ResultlistColumnFormGroup } from
  '../components/arlas-wui-customiser/components/edit-resultlist-columns/edit-resultlist-columns.component';
import { CollectionService } from '../components/arlas-wui-customiser/services/collection-service/collection.service';
import { NUMERIC_OR_DATE_OR_KEYWORD, toOptionsObs } from '../components/arlas-wui-customiser/services/collection-service/tools';
import { DefaultValuesService } from '../components/arlas-wui-customiser/services/default-values/default-values.service';
import { ArlasConfigService, Config, PersistenceService } from 'arlas-wui-toolkit';
import { ArlasColorService } from 'arlas-web-components';
import { ActionModalComponent } from '../components/custom-config-manager/action-modal/action-modal.component';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


export interface CustomList {
  useAsDefault?: boolean;
  columns?: Array<{
    columnName: string;
    fieldName: string;
    dataType: string;
    useColorService: boolean;
  }>;
  keyToColors?: Array<Array<string>>;

}

export interface ConfigListAction {
  type: ConfigListActionEnum;
  enabled?: boolean;
  name?: string;
  url?: string;
  configIdParam?: string;
  config: Config;
}

export enum ConfigListActionEnum {
  VIEW,
  SET_AS_DEFAULT,
  DELETE,
  EDIT,
  DUPLICATE,
  SHARE,
  CREATE,
  RENAME
}

@Injectable({
  providedIn: 'root'
})
export class CustomListService {
  public rightListContributors;
  public mainCollection;
  public redrawList: Subject<void> = new Subject();
  public refreshListConfig: Subject<void> = new Subject();

  public currentListConfigId;
  public constructor(
    private dialog: MatDialog,
    public dialogRefEditListConfig: MatDialogRef<EditResultlistColumnsComponent>,
    private collectionService: CollectionService,
    private defaultValuesService: DefaultValuesService,
    private configService: ArlasConfigService,
    private persistenceService: PersistenceService,
    private colorService: ArlasColorService,
    private route: ActivatedRoute
  ) {

    this.mainCollection = this.configService.getValue('arlas.server.collection.name');
  }


  public applyListStyle(style: CustomList, id?: string) {
    if (!!id) {
      this.currentListConfigId = id;
    }
    style.columns.map(nc => nc.fieldName).forEach(fc => {
      if (!(this.rightListContributors[0].includesvalues as Array<string>).includes(fc)) {
        this.rightListContributors[0].includesvalues.push(fc);
      }
    });
    ;
    this.rightListContributors[0].fieldsList = style.columns;
    this.redrawList.next();
  }

  public mergeKeyToColors() {
    // TODO
  }

  public getFullName(name): string {
    const configId = !!this.route.snapshot.queryParamMap.get('config_id') ? this.route.snapshot.queryParamMap.get('config_id') : 'local';
    const fullName = configId + '_' + 'config_list' + '_' + name;
    return fullName;
  }

  public getNameFromKey(key): string {
    return key.split('config_list_')[1];

  }

  public setAsDefault(configId) {
    // Step 1 : find the current default config
    this.persistenceService.list('config_list', 100, 1, 'desc').subscribe(data => {
      const defaulConfig = data.data.filter(d => JSON.parse(d.doc_value).useAsDefault);
      if (defaulConfig.length > 0) {
        const defaultConfigId = defaulConfig[0].id;
        // Step 2: set default to false
        const configObj = JSON.parse(defaulConfig[0].doc_value);
        configObj.useAsDefault = false;
        this.persistenceService.update(defaultConfigId, JSON.stringify(configObj), new Date(defaulConfig[0].last_update_date).getTime())
          .subscribe(() => { });
      }
      // Step 3: assign the new default style
      this.persistenceService.get(configId).subscribe(c => {
        console.log(c);
        const newConfigObj = JSON.parse(c.doc_value);
        newConfigObj.useAsDefault = true;
        this.persistenceService.update(configId, JSON.stringify(newConfigObj), new Date(c.last_update_date).getTime())
          .subscribe(() => {
            this.refreshListConfig.next();
            this.currentListConfigId = configId;
          });
      });
    });
  }

  public save(name, configToSave, dialogRef) {
    this.persistenceService.create('config_list', this.getFullName(name), JSON.stringify(configToSave), [], [])
      .subscribe(
        data => {
          this.applyListStyle(configToSave, data.id);
          this.dialogRefEditListConfig.close();
          dialogRef.close();
          this.refreshListConfig.next();
        },
        error => {

        });
  }

  public update(configToUpdate, configId, name, isDefault) {
    this.persistenceService.get(configId).subscribe(c => {
      const newConfigObj = JSON.parse(configToUpdate.doc_value);
      newConfigObj.useAsDefault = isDefault;
      this.persistenceService.update(configId, JSON.stringify(newConfigObj), new Date(c.last_update_date).getTime(), name)
        .subscribe(() => {
          this.refreshListConfig.next();
        });
    });
  }

  public openEditResultListConfig(style?: CustomList, configId?: string, configName?: string, isDefault?: boolean) {
    this.dialogRefEditListConfig = this.dialog.open(EditResultlistColumnsComponent, {
      disableClose: false
    });
    if (!style) {
      style = {};
      style.columns = this.rightListContributors[0].fieldsList;
      style.keyToColors = this.colorService.colorGenerator.keysToColors;
    }
    this.dialogRefEditListConfig.componentInstance.collection = this.mainCollection;
    this.dialogRefEditListConfig.componentInstance.mode = !!configId ? EditModeEnum.UPDATE : EditModeEnum.CREATE;
    const controls = style.columns.map(c => {
      const fieldObs = toOptionsObs(this.collectionService.getCollectionFields(this.mainCollection, NUMERIC_OR_DATE_OR_KEYWORD));
      const column = new ResultlistColumnFormGroup(
        fieldObs,
        this.mainCollection,
        new FormArray([]),
        this.defaultValuesService.getDefaultConfig(),
        this.dialog,
        this.collectionService,
        this.colorService);
      [
        {
          value: c.columnName,
          control: column.customControls.columnName
        },
        {
          value: c.fieldName,
          control: column.customControls.fieldName
        },
        {
          value: c.dataType,
          control: column.customControls.dataType
        },
        {
          value: c.useColorService,
          control: column.customControls.useColorService
        },
      ].filter(e => e.value !== null)
        .forEach(element => element.control.setValue(element.value));
      return column;
    });
    this.dialogRefEditListConfig.componentInstance.control = new FormArray(controls);

    this.dialogRefEditListConfig.componentInstance.applyStyle.subscribe(c => {
      const newColumn = this.getConfigFromControl(c);
      this.applyListStyle({
        columns: newColumn.columns
      });
    });
    this.dialogRefEditListConfig.componentInstance.updateStyle.subscribe(c => {
      const dialogRef = this.dialog.open(ActionModalComponent, {
        disableClose: true,
        data: {
          type: ConfigListActionEnum.EDIT
        }
      });
      dialogRef.componentInstance.value = configName;
      dialogRef.componentInstance.default = isDefault;
      dialogRef.componentInstance.updateConfig.subscribe(e => {
        const configToSave = this.getConfigFromControl(c, e);
        this.update(configToSave, configId, configName, isDefault);

      });
    });

    this.dialogRefEditListConfig.componentInstance.saveStyle.subscribe(c => {
      const dialogRef = this.dialog.open(ActionModalComponent, {
        disableClose: true,
        data: {
          type: ConfigListActionEnum.CREATE
        }
      });
      dialogRef.componentInstance.saveNewConfig.subscribe(e => {
        const configToSave = this.getConfigFromControl(c, e);
        this.save(e.name, configToSave, dialogRef);
      });
    });
  }

  private getConfigFromControl(c, e?): CustomList {
    const newColumn = c.controls.map(c => (
      {
        columnName: c.customControls.columnName.value,
        useColorService: c.customControls.useColorService.value,
        dataType: c.customControls.dataType.value,
        fieldName: c.customControls.fieldName.value,
      })
    );
    const configToSave: CustomList = {
      useAsDefault: e.useAsDefault,
      columns: newColumn,
      keyToColors: []
    };
    return configToSave;
  }
}
