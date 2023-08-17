/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ArlasColorService } from 'arlas-web-components';
import { DialogColorTableComponent } from '../dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '../dialog-color-table/models';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { CollectionConfigFormGroup } from '../../models/collection-config-form';
import { SelectOption, InputFormControl, SelectFormControl, SlideToggleFormControl, ButtonFormControl } from '../../models/config-form';
import { CollectionService } from '../../services/collection-service/collection.service';
import { toOptionsObs, NUMERIC_OR_DATE_OR_KEYWORD } from '../../services/collection-service/tools';
import { DefaultValuesService, DefaultConfig } from '../../services/default-values/default-values.service';
@Component({
  selector: 'arlas-edit-resultlist-columns',
  templateUrl: './edit-resultlist-columns.component.html',
  styleUrls: ['./edit-resultlist-columns.component.scss']
})
export class EditResultlistColumnsComponent implements OnInit, AfterViewInit {

  @Input() public control: FormArray;
  @Output() public validateForm: Subject<any> = new Subject<any>();

  @Input() public collection: string;
  @ViewChild('columnTable', { static: true }) public columnTable;

  public dragDisabled = true;

  public displayedColumns: string[] = ['action', 'name', 'field', 'unit', 'colorService'];

  public constructor(private colorService: ArlasColorService,
    private collectionService: CollectionService,
    private defaultValuesService: DefaultValuesService,
    private dialog: MatDialog
  ) {
  }
  public ngAfterViewInit(): void {
    this.columnTable.renderRows();
  }

  public ngOnInit() {
  }

  public addColumn(collection: string) {
    this.control.push(this.buildColumn(collection));
    this.columnTable.renderRows();
  }

  public deleteColumn(colIndex: number) {
    this.control.removeAt(colIndex);
    this.columnTable.renderRows();
  }

  public get columns() {
    return this.control?.controls as Array<ResultlistColumnFormGroup>;
  }

  public drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.control.controls.findIndex(row => row === event.item.data);
    moveItemInArray(this.control.controls, previousIndex, event.currentIndex);
    this.columnTable.renderRows();
  }

  public dragStarted(event) {
    this.dragDisabled = true;
  }

  public buildColumn(collection: string) {
    const fieldObs = toOptionsObs(this.collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_KEYWORD));
    return new ResultlistColumnFormGroup(
      fieldObs,
      collection,
      new FormArray([]),
      this.defaultValuesService.getDefaultConfig(),
      this.dialog,
      this.collectionService,
      this.colorService);
  }
  public validate(control) {
    this.validateForm.next(control);
  }
}
export class ResultlistColumnFormGroup extends CollectionConfigFormGroup {

  public constructor(
    fieldsObs: Observable<Array<SelectOption>>,
    collection: string,
    private globalKeysToColortrl: FormArray,
    defaultConfig: DefaultConfig,
    dialog: MatDialog,
    collectionService: CollectionService,
    private colorService: ArlasColorService
  ) {
    super(collection,
      {
        columnName: new InputFormControl(
          '',
          marker('Column name'),
          ''
        ),
        fieldName: new SelectFormControl(
          '',
          marker('Column field'),
          '',
          true,
          fieldsObs
        ),
        dataType: new InputFormControl(
          '',
          marker('Unit of the column'),
          '',
          undefined,
          {
            optional: true
          }
        ),
        useColorService: new SlideToggleFormControl(
          '',
          marker('Colorize'),
          '',
          {
            optional: true

          }
        ),
        keysToColorsButton: new ButtonFormControl(
          '',
          marker('Manage colors'),
          '',
          () => collectionService.getTermAggregation(this.collection, this.customControls.fieldName.value)
            .then((keywords: Array<string>) => {
              this.globalKeysToColortrl.clear();
              keywords.forEach((k: string, index: number) => {
                this.addToColorManualValuesCtrl({
                  keyword: k.toString(),
                  color: colorService.getColor(k)
                }, index);
              });
              this.addToColorManualValuesCtrl({
                keyword: 'OTHER',
                color: defaultConfig.otherColor
              });

              const sub = dialog.open(DialogColorTableComponent, {
                data: {
                  collection: this.collection,
                  sourceField: this.customControls.fieldName.value,
                  keywordColors: this.globalKeysToColortrl.value
                } as DialogColorTableData,
                autoFocus: false,
              })
                .afterClosed().subscribe((result: Array<KeywordColor>) => {
                  if (result !== undefined) {
                    result.forEach((kc: KeywordColor) => {
                      /** after closing the dialog, save the [keyword, color] list in the Arlas color service */
                      (colorService.colorGenerator as ArlasColorGeneratorLoader).updateKeywordColor(kc.keyword, kc.color);
                      this.addToColorManualValuesCtrl(kc);
                    });
                  }
                  sub.unsubscribe();
                });
            }),
          marker('A field is required to manage colors'),
          {
            optional: true,
            dependsOn: () => [
              this.customControls.useColorService,
              this.customControls.fieldName,
            ],
            onDependencyChange: (control: ButtonFormControl) => {
              control.enableIf(this.customControls.useColorService.value);
              control.disabledButton = !this.customControls.fieldName.value;
            }
          }),
      });
  }

  public customControls = {
    columnName: this.get('columnName') as InputFormControl,
    fieldName: this.get('fieldName') as SelectFormControl,
    dataType: this.get('dataType') as InputFormControl,
    useColorService: this.get('useColorService') as SlideToggleFormControl,
  };

  private addToColorManualValuesCtrl(kc: KeywordColor, index?: number) {
    if (!Object.values(this.globalKeysToColortrl.controls)
      .find(keywordColorGrp => keywordColorGrp.get('keyword').value === kc.keyword)) {
      const keywordColorGrp = new FormGroup({
        keyword: new FormControl(kc.keyword),
        color: new FormControl(kc.color)
      });
      if (index !== undefined) {
        this.globalKeysToColortrl.insert(index, keywordColorGrp);
      } else {
        this.globalKeysToColortrl.push(keywordColorGrp);
      }
    }
  }
}
