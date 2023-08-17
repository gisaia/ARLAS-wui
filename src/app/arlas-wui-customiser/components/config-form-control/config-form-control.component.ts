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
import {
  AfterViewChecked, AfterViewInit,
  ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver,
  Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ButtonFormControl, ButtonToggleFormControl, CollectionsUnitsControl,
  ColorFormControl, ColorPreviewFormControl, ConfigFormControl, FieldWithSizeListFormControl,
  HiddenFormControl, HuePaletteFormControl, IconFormControl, InputFormControl, MapFiltersControl, MetricWithFieldListFormControl,
  MultipleSelectFormControl, OrderedSelectFormControl, RadioButtonFormControl, SelectFormControl, SlideToggleFormControl,
  SliderFormControl,
  TextareaFormControl, TitleInputFormControl, TypedSelectFormControl, UrlTemplateControl
} from 'app/arlas-wui-customiser/models/config-form';
import { CollectionService } from 'app/arlas-wui-customiser/services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ArlasColorService } from 'arlas-web-components';

@Component({
  selector: 'arlas-config-form-control',
  templateUrl: './config-form-control.component.html',
  styleUrls: ['./config-form-control.component.scss']
})
export class ConfigFormControlComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  @Input() public control: ConfigFormControl;
  @Input() public parentFormGroup: FormGroup;
  @Input() public defaultKey: string;
  @Input() public showLabel = true;
  @ViewChild('component', { read: ViewContainerRef, static: false }) private componentContainer: ViewContainerRef;
  @Output() public updateSyncOptions: Subject<string> = new Subject();

  public colorPreviewControl: ColorPreviewFormControl;
  public debouncer: Subject<string> = new Subject();

  public constructor(
    private resolver: ComponentFactoryResolver,
    private changeDetector: ChangeDetectorRef,
    private colorService: ArlasColorService,
    private collectionService: CollectionService
  ) { }

  public onchangeMulitpleSelection(event, clear?: boolean) {

    if (event.checked) {
      (this.control as MultipleSelectFormControl).savedItems.add(event.source.value.value);
    } else {
      (this.control as MultipleSelectFormControl).savedItems.delete(event.source.value.value);
    }

    (this.control as MultipleSelectFormControl).selectedMultipleItems =
      Array.from((this.control as MultipleSelectFormControl).savedItems)
        .map(i => ({ value: i, color: this.colorService.getColor(i), detail: this.collectionService.getCollectionInterval(i) }));
    this.changeDetector.detectChanges();
    if (clear) {
      this.debouncer.next('');
    }
  }

  public ngOnInit() {
    this.colorPreviewControl = this.isColorPreview();
    this.debouncer.pipe(debounceTime(500)).subscribe(t => {
      if (!!(this.control as MultipleSelectFormControl).selectedMultipleItems) {
        (this.control as MultipleSelectFormControl).selectedMultipleItems
          .forEach(i => (this.control as MultipleSelectFormControl).savedItems.add(i.value));
      }
      (this.control as MultipleSelectFormControl).selectedMultipleItems =
        Array.from((this.control as MultipleSelectFormControl).savedItems)
          .map(i => ({ value: i, color: this.colorService.getColor(i), detail: this.collectionService.getCollectionInterval(i) }));
      this.updateSyncOptions.next(t);
    });
  }

  public ngAfterViewInit() {

  }

  /**
   * Clears the input's value and opens the panel of options to choose
   * @param event Event object emitted by the "Click"
   * @param inputElement The input HTML element
   * @param selectControl The Angular control that holds the Input's value
   */
  public clearAutoComplete(event: Event, inputElement: HTMLElement, selectControl: SelectFormControl) {
    event.stopPropagation();
    selectControl.filteredOptions = selectControl.syncOptions;
    selectControl.setValue('');
    inputElement.nodeValue = '';
    inputElement.focus();
  }

  public trackByFn(index, item) {
    return item.value;
  }

  public ngAfterViewChecked(): void {

  }

  public ngOnDestroy() {
    this.control = null;
    this.defaultKey = null;
    this.componentContainer = null;
  }

  public isSlideToggle(): SlideToggleFormControl | null {
    return Object.getPrototypeOf(this.control) === SlideToggleFormControl.prototype ? this.control as SlideToggleFormControl : null;
  }

  public isButtonToggle(): ButtonToggleFormControl | null {
    return Object.getPrototypeOf(this.control) === ButtonToggleFormControl.prototype ? this.control as ButtonToggleFormControl : null;
  }

  public isRadioButton(): RadioButtonFormControl | null {
    return Object.getPrototypeOf(this.control) === RadioButtonFormControl.prototype ? this.control as RadioButtonFormControl : null;
  }

  public isSlider(): SliderFormControl | null {
    return Object.getPrototypeOf(this.control) === SliderFormControl.prototype ? this.control as SliderFormControl : null;
  }

  public isSelect(): SelectFormControl | null {
    return Object.getPrototypeOf(this.control) === SelectFormControl.prototype &&
      !(this.control as SelectFormControl).isAutocomplete ?
      this.control as SelectFormControl : null;
  }

  public isMultipleSelect(): MultipleSelectFormControl | null {
    return Object.getPrototypeOf(this.control) === MultipleSelectFormControl.prototype &&
      !(this.control as MultipleSelectFormControl).isAutocomplete ?
      this.control as MultipleSelectFormControl : null;
  }

  public isTypedSelect(): TypedSelectFormControl | null {
    return Object.getPrototypeOf(this.control) === TypedSelectFormControl.prototype &&
      !(this.control as TypedSelectFormControl).isAutocomplete ?
      this.control as TypedSelectFormControl : null;
  }


  public isAutocomplete(): SelectFormControl | null {
    return Object.getPrototypeOf(this.control) === SelectFormControl.prototype &&
      (this.control as SelectFormControl).isAutocomplete ?
      this.control as SelectFormControl : null;
  }

  public isTypedAutocomplete(): TypedSelectFormControl | null {
    return Object.getPrototypeOf(this.control) === TypedSelectFormControl.prototype &&
      (this.control as TypedSelectFormControl).isAutocomplete ?
      this.control as TypedSelectFormControl : null;
  }

  public isOrderedSelect(): OrderedSelectFormControl | null {
    return Object.getPrototypeOf(this.control) === OrderedSelectFormControl.prototype ? this.control as OrderedSelectFormControl : null;
  }

  public isInput(): InputFormControl | null {
    return (Object.getPrototypeOf(this.control) === InputFormControl.prototype &&
      Object.getPrototypeOf(this.control) !== TitleInputFormControl.prototype) ? this.control as InputFormControl : null;
  }

  public displayWith(event) {
    return event.value;
  }

  public isTitleInput(): InputFormControl | null {
    return Object.getPrototypeOf(this.control) === TitleInputFormControl.prototype ? this.control as TitleInputFormControl : null;
  }

  public isIcon(): IconFormControl | null {
    return Object.getPrototypeOf(this.control) === IconFormControl.prototype ? this.control as IconFormControl : null;
  }

  public isColor(): ColorFormControl | null {
    return Object.getPrototypeOf(this.control) === ColorFormControl.prototype ? this.control as ColorFormControl : null;
  }

  public isColorPreview(): ColorPreviewFormControl | null {
    return Object.getPrototypeOf(this.control) === ColorPreviewFormControl.prototype ? this.control as ColorPreviewFormControl : null;
  }

  public isHuePalette(): HuePaletteFormControl | null {
    return Object.getPrototypeOf(this.control) === HuePaletteFormControl.prototype ? this.control as HuePaletteFormControl : null;
  }

  public isHidden(): HiddenFormControl | null {
    return Object.getPrototypeOf(this.control) === HiddenFormControl.prototype ? this.control as HiddenFormControl : null;
  }

  public isButton(): ButtonFormControl | null {
    return Object.getPrototypeOf(this.control) === ButtonFormControl.prototype ? this.control as ButtonFormControl : null;
  }

  public isMapFilters(): MapFiltersControl | null {
    return Object.getPrototypeOf(this.control) === MapFiltersControl.prototype ? this.control as MapFiltersControl : null;
  }

  public isCollectionsUnits(): CollectionsUnitsControl | null {
    return Object.getPrototypeOf(this.control) === CollectionsUnitsControl.prototype ? this.control as CollectionsUnitsControl : null;
  }

  public isMetricWithFieldList(): MetricWithFieldListFormControl | null {
    return Object.getPrototypeOf(this.control) === MetricWithFieldListFormControl.prototype ?
      this.control as MetricWithFieldListFormControl : null;
  }

  public isFieldWithSizeList(): FieldWithSizeListFormControl | null {
    return Object.getPrototypeOf(this.control) === FieldWithSizeListFormControl.prototype ?
      this.control as FieldWithSizeListFormControl : null;
  }

  public isUrlTemplate(): UrlTemplateControl | null {
    return Object.getPrototypeOf(this.control) === UrlTemplateControl.prototype ?
      this.control as UrlTemplateControl : null;
  }

  public isTextarea(): TextareaFormControl | null {
    return Object.getPrototypeOf(this.control) === TextareaFormControl.prototype ? this.control as TextareaFormControl : null;
  }
}
