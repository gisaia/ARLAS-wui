/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CollectionService } from '../../services/collection-service/collection.service';
import { from, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DialogColorTableData } from './models';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';

@Component({
  selector: 'arlas-dialog-color-table',
  templateUrl: './dialog-color-table.component.html',
  styleUrls: ['./dialog-color-table.component.scss']
})
export class DialogColorTableComponent implements OnInit {

  public keywordColorsForm: FormArray;
  public dataSource: MatTableDataSource<AbstractControl>;
  public displayedColumns = ['keyword', 'color'];
  public filter: string;
  public newKeywordValues: Observable<Array<string>>;
  public newKeywordCtrl = new FormControl();

  public constructor(
    public dialogRef: MatDialogRef<DialogColorTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogColorTableData,
    private formBuilder: FormBuilder,
    private colorService: ArlasColorGeneratorLoader,
    private collectionService: CollectionService
  ) { }

  public ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('800px');

    // build the form with all keywords / colors
    this.keywordColorsForm = this.formBuilder.array([]);
    this.data.keywordColors.filter(kc => kc.keyword.length > 0).forEach(kc =>
      this.keywordColorsForm.push(this.formBuilder.group({
        keyword: [kc.keyword],
        color: [kc.color]
      })));
    this.dataSource = new MatTableDataSource(this.keywordColorsForm.controls);
    this.dataSource.filterPredicate =
      (data: FormGroup, filter: string): boolean => data.controls.keyword.value.toLowerCase().includes(filter);

    this.newKeywordValues = this.newKeywordCtrl.valueChanges.pipe(
      mergeMap((value: string) => {
        if (value.length > 1) {
          return from(this.collectionService.getTermAggregationStartWith(
            this.data.collection,
            this.data.sourceField,
            value));
        } else {
          // for performance issues, require to type at least 2 letters
          return of([]);
        }
      })
    );
  }

  public applyFilter() {
    this.dataSource.filter = this.filter.trim().toLowerCase();
  }

  public addKeyword() {
    this.keywordColorsForm.insert(0, this.formBuilder.group({
      keyword: [this.newKeywordCtrl.value],
      color: [this.colorService.getColor(this.newKeywordCtrl.value)]
    }));
    // update table rendering
    this.dataSource._updateChangeSubscription();
  }

  public alreadyHasNewKeyword() {
    return this.keywordColorsForm.value.filter(fg => fg.keyword === this.newKeywordCtrl.value).length > 0;
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public reset(fg: FormGroup) {
    fg.get('color').setValue(
      this.colorService.getColor(fg.get('keyword').value));
  }

  public remove(index: number) {
    this.keywordColorsForm.removeAt(index);
    // update table rendering
    this.dataSource._updateChangeSubscription();
  }

}
