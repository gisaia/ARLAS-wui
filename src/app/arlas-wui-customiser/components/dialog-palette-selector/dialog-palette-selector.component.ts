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

import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProportionedValues } from '../../services/property-selector-form-builder/models';
import * as d3c from 'd3-color';
import * as d3i from 'd3-interpolate';
import { DialogPaletteSelectorData } from './model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'arlas-dialog-palette',
  templateUrl: './dialog-palette-selector.component.html',
  styleUrls: ['./dialog-palette-selector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogPaletteSelectorComponent implements OnInit {

  public defaultPalettes: ProportionedValues[][];
  public selectedPalette: ProportionedValues[];

  public constructor(
    public dialogRef: MatDialogRef<DialogPaletteSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogPaletteSelectorData,
    public translateService: TranslateService
  ) { }

  public ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('800px');
    this.prepareDefaultPalettes();
  }

  private prepareDefaultPalettes() {
    this.selectedPalette = this.data.selectedPalette;
    this.defaultPalettes = this.data.defaultPalettes
      .map((p: Array<string>) => p
        .map((c: string, i: number) => ({ proportion: this.computeProportion(p.length, i), value: c })));
  }

  public resetProportions() {
    this.selectedPalette = this.selectedPalette.map((c: ProportionedValues, i: number) => ({
      proportion: this.computeProportion(this.selectedPalette.length, i),
      value: c.value
    }));
  }

  private computeProportion(length: number, index: number) {
    return this.data.min + index * (this.data.max - this.data.min) / (length - 1);
  }

  public getSelectedPaletteGradients() {
    return this.selectedPalette.map(
      c => c.value + ' ' + (100 * (c.proportion - this.data.min) / (this.data.max - this.data.min)) + '%').join(',');
  }

  public drop(event: CdkDragDrop<string[]>) {
    // only reverse the color, proportions should stay consistent
    const previousColor = this.selectedPalette[event.previousIndex].value;
    const currentColor = this.selectedPalette[event.currentIndex].value;
    this.selectedPalette[event.currentIndex].value = previousColor;
    this.selectedPalette[event.previousIndex].value = currentColor;
  }

  private interpolateColor(color1: string, color2: string, step: number) {
    return d3c.color(d3i.interpolateRgb(color1, color2)(step)).formatHex();
  }

  public selectPalette(index: number) {
    this.selectedPalette = this.defaultPalettes[index].slice();
  }

  // reverse the colors but not the proportions
  public reverse() {
    const proportions = this.selectedPalette.map(p => p.proportion);
    const values = this.selectedPalette.map(p => p.value);
    this.selectedPalette = values.reverse().map(
      (value, index) => ({ proportion: proportions[index], value }));
  }

  public add(index: number) {
    const newColor = (index === this.selectedPalette.length - 1) ?
      this.selectedPalette[index].value :
      this.interpolateColor(
        this.selectedPalette[index].value as string,
        this.selectedPalette[index + 1].value as string,
        0.5);
    this.selectedPalette.splice(index + 1, 0, { proportion: this.selectedPalette[index].proportion, value: newColor });
  }

  public remove(index: number) {
    this.selectedPalette.splice(index, 1);
  }

  public isValid() {
    return this.selectedPalette[0].proportion === this.data.min
      && this.selectedPalette.slice(-1)[0].proportion === this.data.max
      && this.selectedPalette.slice(0, -1).map((c: ProportionedValues, i: number) =>
        c.proportion < this.selectedPalette[i + 1].proportion).reduce((a, b) => a && b);
  }

}
