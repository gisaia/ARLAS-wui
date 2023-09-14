import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditModeEnum, EditResultlistColumnsComponent, ResultlistColumnFormGroup } from
  '../components/arlas-wui-customiser/components/edit-resultlist-columns/edit-resultlist-columns.component';
import { CollectionService } from '../components/arlas-wui-customiser/services/collection-service/collection.service';
import { NUMERIC_OR_DATE_OR_KEYWORD, toOptionsObs } from '../components/arlas-wui-customiser/services/collection-service/tools';
import { DefaultValuesService } from '../components/arlas-wui-customiser/services/default-values/default-values.service';
import { ArlasColorGeneratorLoader, ArlasConfigService, Config, PersistenceService } from 'arlas-wui-toolkit';
import { ArlasColorService } from 'arlas-web-components';
import { ActionModalComponent } from '../components/custom-config-manager/action-modal/action-modal.component';
import { Observable, Subject, filter, map, mergeMap, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


export interface CustomList {
  useAsDefault?: boolean;
  columns?: Array<{
    columnName: string;
    fieldName: string;
    dataType: string;
    useColorService: boolean;
  }>;
  keyToColors?: [string,string][];

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
  public redrawList: Subject<any> = new Subject();
  public refreshListConfig: Subject<void> = new Subject();
  public currentListConfig;
  public currentListConfigId;
  public initialListConfig;
  public initialKeyToColors;

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
    style.keyToColors.forEach(kc => {
      (this.colorService.colorGenerator as ArlasColorGeneratorLoader).updateKeywordColor(kc[0], kc[1]);
    });
    this.rightListContributors[0].fieldsList = style.columns;
    this.redrawList.next(style.keyToColors);
  }

  public getFullName(name): string {
    const configId = !!this.route.snapshot.queryParamMap.get('config_id') ? this.route.snapshot.queryParamMap.get('config_id') : 'local';
    const fullName = configId + '_' + 'config_list' + '_' + name;
    return fullName;
  }

  public getNameFromKey(key): string {
    return key.split('config_list_')[1];

  }

  public getDefaultConfig(): Observable<any | undefined> {
    return this.persistenceService.list('config_list', 100, 1, 'desc').pipe(map(data => {
      if (!!data.data) {
        const defaulConfig = data.data.filter(d => JSON.parse(d.doc_value).useAsDefault);
        if (defaulConfig.length > 0) {
          return [JSON.parse(defaulConfig[0].doc_value), defaulConfig[0].id];
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }

    }));
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
        const newConfigObj = JSON.parse(c.doc_value);
        newConfigObj.useAsDefault = true;
        this.persistenceService.update(configId, JSON.stringify(newConfigObj), new Date(c.last_update_date).getTime())
          .subscribe(() => {
            this.refreshListConfig.next();
          });
      });
    });
  }

  public save(name, configToSave, dialogRef) {
    if (configToSave.useAsDefault) {
      this.removeCurrentDefault().subscribe(() => {
        this.onlySave(name, configToSave, dialogRef);
      });
    } else {
      this.onlySave(name, configToSave, dialogRef);
    }
  }

  private onlySave(name: any, configToSave: any, dialogRef: any) {
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

  public update(configToUpdate, configId, name, isDefault, dialogRef) {
    if (isDefault) {
      this.removeCurrentDefault().subscribe(() => {
        this.onlyUpdate(configId, configToUpdate, isDefault, name, dialogRef);
      });
    } else {
      this.onlyUpdate(configId, configToUpdate, isDefault, name, dialogRef);
    }
  }


  private onlyUpdate(configId: any, configToUpdate: any, isDefault: any, name: any, dialogRef: any) {
    this.persistenceService.get(configId).subscribe(c => {
      const newConfigObj = configToUpdate;
      newConfigObj.useAsDefault = isDefault;
      this.persistenceService.update(configId, JSON.stringify(newConfigObj), new Date(c.last_update_date).getTime(), this.getFullName(name))
        .subscribe(() => {
          this.dialogRefEditListConfig.close();
          dialogRef.close();
          this.refreshListConfig.next();
        });
    });
  }

  public removeCurrentDefault() {
    return this.persistenceService.list('config_list', 100, 1, 'desc').pipe(mergeMap(data => {
      if (!!data.data) {
        const defaulConfig = data.data.filter(d => JSON.parse(d.doc_value).useAsDefault);
        if (defaulConfig.length > 0) {
          const defaultConfigId = defaulConfig[0].id;
          const configObj = JSON.parse(defaulConfig[0].doc_value);
          configObj.useAsDefault = false;
          return this.persistenceService.update(defaultConfigId, JSON.stringify(configObj), new Date(defaulConfig[0].last_update_date).getTime());
        }
      } else {
        return of({});
      }
    }));
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
      const newStyle = this.getConfigFromControl(c);
      this.applyListStyle({
        columns: newStyle.columns,
        keyToColors: newStyle.keyToColors
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
        this.update(configToSave, configId, configName, e.useAsDefault, dialogRef);
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
    const keyToColorsValue = this.dialogRefEditListConfig.componentInstance.columns.flatMap(c => c.globalKeysToColortrl.value);
    const configToSave: CustomList = {
      useAsDefault: !!e ? e.useAsDefault : false,
      columns: newColumn,
      keyToColors: keyToColorsValue.map( kc => [kc.keyword,kc.color])
    };
    return configToSave;
  }
}
