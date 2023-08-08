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

import {
  FormGroup, ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormControl, AbstractControl, Validators, FormArray
} from '@angular/forms';
import { Observable, skip } from 'rxjs';
import { HistogramUtils } from 'arlas-d3';
import { CollectionField } from '../services/collection-service/models';
import { METRIC_TYPES } from '../services/collection-service/collection.service';
import { toKeywordOptionsObs, toNumericOrDateOptionsObs, toNumericOrDateOrKeywordOrTextObs } from '../services/collection-service/tools';
import { ProportionedValues } from '../services/property-selector-form-builder/models';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { updateValueAndValidity } from '../utils/tools';
import { ComputeConfig } from 'arlas-web-contributors';

/**
 * These are wrappers above existing FormGroup and FormControl in order to add a custom behavior.
 * The goal is to have a full model-driven form without putting (or duplicating) the logic
 * into the view or into the ngOnInit.
 * Looking for one control, everything should be described into its declaration.
 */

export type FormGroupElement = ConfigFormControl | ConfigFormGroup | FormArray;

export interface SelectOption {
  value: any;
  label: any;
  enabled?: boolean;
  type?: CollectionReferenceDescriptionProperty.TypeEnum;
  color?: string;
  detail?: string;
}

export abstract class ConfigFormControl extends FormControl {

  // reference to other controls that depends on this one
  public dependantControls: Array<AbstractControl>;

  // if it is a child control, it is to be displayed below another controls into a single config element
  public isChild = false;
  // an initial value is used by app-reset-on-change, when resetting a form control (instead of a "default.json" value)
  public initialValue: any;

  public constructor(
    formState: any,
    public label: string,
    public description: string,
    private optionalParams: ControlOptionalParams = {}) {

    super(formState);
    this.initialValue = formState;
    // add default values to missing attributes
    this.optionalParams = {
      ...{
        optional: false,
        validators: [],
        dependsOn: () => [],
        onDependencyChange: () => null,
        childs: () => [],
        isDescriptionHtml: false
      },
      ...this.optionalParams
    };
    this.initValidators();
  }

  public get optional() {
    return this.optionalParams.optional;
  }
  public get width() {
    return this.optionalParams.width;
  }
  public get sourceData() {
    return this.optionalParams.sourceData;
  }
  public get dependsOn() {
    return this.optionalParams.dependsOn;
  }
  public get onDependencyChange() {
    return this.optionalParams.onDependencyChange;
  }
  public get childs() {
    return this.optionalParams.childs;
  }
  public get isDescriptionHtml() {
    return this.optionalParams.isDescriptionHtml;
  }
  public get resetDependantsOnChange() {
    return this.optionalParams.resetDependantsOnChange || false;
  }
  public get title() {
    return this.optionalParams.title;
  }

  public initValidators() {
    const optionalValidator = this.optionalParams.optional ? [] : [Validators.required];
    this.setValidators(optionalValidator.concat(this.optionalParams.validators));
  }

  public enableIf(condition: boolean) {
    // prevent a single control to get enabled whereas the parent is disabled
    // => this would enable the parent again
    if (condition && this.parent.status !== 'DISABLED') {
      this.enable();
    } else {
      this.disable({ emitEvent: false });
    }
  }

}

export interface ControlOptionalParams {

  // if false, it is a required control
  optional?: boolean;

  // getter the other controls that it depends on
  dependsOn?: () => Array<ConfigFormControl | ConfigFormGroup>;

  /**
   * Callback to be executed when a dependency changes.
   * It is also executed during import or by loading the object from a ConfigFormGroupComponent
   * c : the ConfigForm object
   * isLoading: indicates if the is exeuted on initial load or import
   */
  onDependencyChange?: (c: ConfigFormControl | ConfigFormGroup, isLoading?: boolean) => void;

  // indicates if other fields that depends on this one, should be reset when this one changes
  resetDependantsOnChange?: boolean;

  // usual validators
  validators?: ValidatorFn[];

  // getter of child components
  childs?: () => Array<ConfigFormControl>;

  // is the description in regular HTML. In this case, the caller
  // is responsable of translating its content
  isDescriptionHtml?: boolean;

  // a title that is displayed before the field.
  // TODO remove the title from ConfigFormGroup and move it to fields
  title?: string;

  sourceData?: Observable<any>;

  width?: string;
}

export interface GroupOptionalParams {
  // getter the other controls that it depends on
  dependsOn?: () => Array<ConfigFormControl>;

  /**
   * Callback to be executed when a dependency changes.
   * It is also executed during import or by loading the object from a ConfigFormGroupComponent
   * c : the ConfigForm object
   * isLoading: indicates if the is exeuted on initial load or import
   */
  onDependencyChange?: (c: ConfigFormControl | ConfigFormGroup, isLoading?: boolean) => void;

  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null;
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null;
}

export class ConfigFormGroup extends FormGroup<{[key: string]: FormGroupElement;}> {

  // reference to other controls that depends on this one
  public dependantControls: Array<AbstractControl>;

  public title: string;
  public stepName: string;
  public tabName: string;

  public hide = false;

  public constructor(
    controls: {
      [key: string]: FormGroupElement;
    } = {},
    private optionalParams: GroupOptionalParams = {}) {

    super(controls, optionalParams.validatorOrOpts, optionalParams.asyncValidator);
  }

  public get dependsOn() {
    return this.optionalParams.dependsOn;
  }
  public get onDependencyChange() {
    return this.optionalParams.onDependencyChange;
  }

  public get controlsRecursively() {
    return this.getControls(this);
  }

  private getControls(control: FormGroup | FormArray): Array<AbstractControl> {
    return Object.values(control.controls).flatMap(c => {
      if (c instanceof FormControl) {
        return [c];
      } else if (c instanceof FormGroup || c instanceof FormArray) {
        return [
          c,
          ...this.getControls(c)
        ];
      } else {
        return [];
      }
    });
  }

  public get configFormControls(): Array<ConfigFormControl> {
    return Object.values(this.controls).filter(c => c instanceof ConfigFormControl) as Array<ConfigFormControl>;
  }

  public hideStep(hide: boolean) {
    this.hide = hide;
    return this;
  }

  public withTitle(title: string) {
    this.title = title;
    return this;
  }

  public withStepName(stepName: string) {
    this.stepName = stepName;
    return this;
  }

  public withTabName(tabName: string) {
    this.tabName = tabName;
    return this;
  }

  public withDependsOn(dependsOn: () => Array<ConfigFormControl>) {
    this.optionalParams.dependsOn = dependsOn;
    return this;
  }
  public withOnDependencyChange(onDependencyChange: (c: ConfigFormControl | ConfigFormGroup) => void) {
    this.optionalParams.onDependencyChange = onDependencyChange;
    return this;
  }

  public withControl(key: string, control: FormGroupElement) {
    this.controls[key] = control;
    return this;
  }


  public enableIf(condition: boolean) {
    if (condition) {
      this.enable();
      // make sure that the state of all sub-controls is up-to-date against other controls
      this.controlsRecursively
        .filter(c => c instanceof ConfigFormGroup || c instanceof ConfigFormControl)
        .filter((c: ConfigFormGroup | ConfigFormControl) => !!c.onDependencyChange)
        .forEach((c: ConfigFormGroup | ConfigFormControl) => c.onDependencyChange(c));
    } else {
      // emitEvent: false avoid the cascading effect. When enabling, it is expected to propagate
      // the status update so that dependan fields can update themselves. Whereas when disabling
      // we just want to disable everything. moreover, without it, some sub-fields may still be
      // enabled, probably because of the cascading update
      this.disable({ emitEvent: false });
    }
  }
}

// Represent an FormArray of FormGroup, i.a. a repeated FormGroup.
// Can be used to handle some fields by collection for example.
export class ConfigFormGroupArray extends FormArray {

  public title: string;
  public description: string;
  public note: string;
  public emptylistNote: string;
  public constructor(controls: ConfigFormGroup[]) {
    super(controls);
  }

  public addTitle(t: string): ConfigFormGroupArray {
    this.title = t;
    return this;
  }

  public addDescription(desc: string): ConfigFormGroupArray {
    this.description = desc;
    return this;
  }

  public addNote(note: string): ConfigFormGroupArray {
    this.note = note;
    return this;
  }

  public addEmptylistNote(emptylistNote: string): ConfigFormGroupArray {
    this.emptylistNote = emptylistNote;
    return this;
  }
}

export class SlideToggleFormControl extends ConfigFormControl {
  public constructor(
    formState: any,
    label: string,
    description: string,
    optionalParams?: ControlOptionalParams
  ) {

    super(formState, label, description, { ...optionalParams, ... { optional: true } });
  }
}


export class ButtonToggleFormControl extends ConfigFormControl {
  public constructor(
    formState: any,
    public options: Array<{ label: string; value: any; }>,
    description: string,
    optionalParams?: ControlOptionalParams
  ) {

    super(
      !!formState ? formState : !!options.length ? options[0].value : null,
      null,
      description,
      optionalParams);
  }
}
export class RadioButtonFormControl extends ConfigFormControl {
  public constructor(
    public options: Array<{ label: string; value: any; }>,
    description: string,
    optionalParams?: ControlOptionalParams
  ) {
    super(
      !!options.length ? options[0].value : null,
      null,
      description,
      optionalParams);
  }
}


export class SelectFormControl extends ConfigFormControl {

  // used only for autocomplete: list of filtered options
  public filteredOptions: Array<SelectOption>;
  public syncOptions: Array<SelectOption> = [];

  public constructor(
    formState: any,
    label: string,
    description: string,
    public isAutocomplete: boolean,
    options: Array<SelectOption> | Observable<Array<SelectOption>>,
    optionalParams?: ControlOptionalParams) {

    super(
      formState,
      label,
      description,
      optionalParams);

    if (options instanceof Observable) {
      options.subscribe(opts => {
        this.setSyncOptions(opts);
        this.updateValueAndValidity({emitEvent: true});
      });
    } else if (options instanceof Array) {
      this.setSyncOptions(options);
    }

    if (isAutocomplete) {
      // TODO should we unsubscribe later?
      this.valueChanges.subscribe(v => {
        if (!!v) {
          this.filteredOptions = this.syncOptions.filter(o => o.label.indexOf(v) >= 0);
        } else {
          this.filteredOptions = this.syncOptions;
        }

      }
      );
    }

  }

  public setSyncOptions(newOptions: Array<SelectOption>) {
    this.syncOptions = newOptions;
    this.filteredOptions = newOptions;
  }
}


export class MultipleSelectFormControl extends ConfigFormControl {

  // used only for autocomplete: list of filtered options
  public filteredOptions: Array<SelectOption>;
  public syncOptions: Array<SelectOption> = [];
  public selectedMultipleItems: Array<{ value: any; color?: string; detail?: string; }> = [];
  public savedItems = new Set<string>();
  public searchable = true;
  public constructor(
    formState: any,
    label: string,
    description: string,
    public isAutocomplete: boolean,
    options: Array<SelectOption> | Observable<Array<SelectOption>>,
    optionalParams?: ControlOptionalParams,
    searchable?: boolean,
  ) {

    super(
      formState,
      label,
      description,
      optionalParams);

    if (options instanceof Observable) {
      options.subscribe(opts => this.setSyncOptions(opts));
    } else if (options instanceof Array) {
      this.setSyncOptions(options);
    }

    if (isAutocomplete) {
      // TODO should we unsubscribe later?
      this.valueChanges.subscribe(v => {
        if (!!v) {
          this.filteredOptions = this.syncOptions.filter(o => o.label.indexOf(v) >= 0);
        } else {
          this.filteredOptions = this.syncOptions;
        }

      }
      );
    }

    this.searchable = searchable;
  }

  public setSyncOptions(newOptions: Array<SelectOption>) {
    this.syncOptions = newOptions;
    this.filteredOptions = newOptions;
  }
}

export class TypedSelectFormControl extends ConfigFormControl {

  // used only for autocomplete: list of filtered options
  public filteredOptions: Array<SelectOption>;
  public syncOptions: Array<SelectOption> = [];

  public constructor(
    formState: any,
    label: string,
    description: string,
    public isAutocomplete: boolean,
    options: Array<SelectOption> | Observable<Array<SelectOption>>,
    optionalParams?: ControlOptionalParams) {

    super(
      formState,
      label,
      description,
      optionalParams);

    if (options instanceof Observable) {
      options.subscribe(opts => this.setSyncOptions(opts));
    } else if (options instanceof Array) {
      this.setSyncOptions(options);
    }

    if (isAutocomplete) {
      // TODO should we unsubscribe later?
      this.valueChanges.subscribe(v => {
        if (!!v) {
          this.filteredOptions = this.syncOptions.filter(o => o.label.indexOf(v) >= 0);
        } else {
          this.filteredOptions = this.syncOptions;
        }

      }
      );
    }
  }

  public setSyncOptions(newOptions: Array<SelectOption>) {
    this.syncOptions = newOptions;
    this.filteredOptions = newOptions;
  }
}

export class OrderedSelectFormControl extends SelectFormControl {
  public sortDirection: string;
  public sorts: Set<string> = new Set();
  public addSort(sort: string, event) {
    event.stopPropagation();
    this.sorts.add(sort);
    this.setSortValue();
  }

  public removeSort(sort: string) {
    this.sorts.delete(sort);
    this.setSortValue();
  }

  private setSortValue() {
    if (this.sorts.size > 0) {
      const sortValue = Array.from(this.sorts).reduce((a, b) => a + ',' + b);
      this.setValue(sortValue);
    } else {
      this.setValue(null);
    }
  }
}

export function checkArlasFilter(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any; } | null => {
    let isValid = false;
    try {
      const f = JSON.parse(control.value);
      isValid = !!f.q || !!f.f || Object.keys(f).length === 0;
      if (isValid) {
        return null;
      } else {
        return { jsonNotValid: true };;
      }
    } catch (e) {
      return { jsonNotValid: true };;
    }
  };
}

export class MetricWithFieldListFormControl extends ConfigFormControl {

  public METRICS = [
    METRIC_TYPES.AVG, METRIC_TYPES.SUM, METRIC_TYPES.MIN, METRIC_TYPES.MAX, METRIC_TYPES.CARDINALITY, 'count'
  ];
  // TODO do not use validators, the fields look like in error
  public metricCtrl = new FormControl<METRIC_TYPES | 'count'>('count', Validators.required);
  public fieldCtrl = new FormControl('', [
    Validators.required,
    (c) => !!this.autocompleteFilteredFields && this.autocompleteFilteredFields.map(f => f.value).indexOf(c.value) >= 0 ?
      null : { validateField: { valid: false } }
  ]);
  public arlasFilterCtrl = new FormControl('{}', checkArlasFilter());
  public metricFields: Array<SelectOption>;
  public autocompleteFilteredFields: Array<SelectOption>;
  public isUpdateState = false;
  public currentEditing;
  public valueChanged = false;
  public isPanelClose = true;
  public constructor(
    formState: any,
    label: string,
    description: string,
    public collectionFields: Observable<Array<CollectionField>>,
    optionalParams?: ControlOptionalParams
  ) {
    super(formState, label, description, optionalParams);
    if (!this.optional) {
      // as the value is a set, if the control is required, an empty set should also be an error
      this.setValidators([
        (control) => !!control.value && Array.from(control.value).length > 0 ? null : { required: { valid: false } },
        checkArlasFilter
      ]);
    }
    this.metricCtrl.valueChanges.subscribe(v => {
      if (this.metricCtrl.value === 'count') {
        this.fieldCtrl.disable();
      } else {
        this.fieldCtrl.enable();
      }
      this.updateFieldsByMetric(this.metricCtrl.value);
      this.fieldCtrl.reset();
    });
    this.fieldCtrl.valueChanges.subscribe(v => this.filterAutocomplete(v));
    this.filterAutocomplete();
    this.updateFieldsByMetric(this.metricCtrl.value);
    this.setValue(new Set());
  }

  public updateFieldsByMetric(metric: METRIC_TYPES | 'count') {
    const fieldObs = this.metricCtrl.value === METRIC_TYPES.CARDINALITY ?
      toKeywordOptionsObs(this.collectionFields) : toNumericOrDateOptionsObs(this.collectionFields);
    fieldObs.subscribe(f => {
      this.metricFields = f;
      this.filterAutocomplete();
    });
  }

  public afterExpandFilter() {
    this.isPanelClose = false;
  }
  public afterCloseFilter() {
    this.isPanelClose = true;

  }

  public stringToMetricsEnum(value: string) {
    switch (value) {
      case 'avg': {
        return METRIC_TYPES.AVG;
      }
      case 'sum': {
        return METRIC_TYPES.SUM;
      }
      case 'min': {
        return METRIC_TYPES.MIN;
      }
      case 'max': {
        return METRIC_TYPES.MAX;
      }
      case 'cardinality': {
        return METRIC_TYPES.CARDINALITY;
      }
      case 'count': {
        return 'count';
      }
    }
  }

  public onClickFilterChip(event, opt) {
    this.isUpdateState = true;
    this.currentEditing = opt;
    this.metricCtrl.setValue(this.stringToMetricsEnum(opt.metric));
    this.updateFieldsByMetric(this.stringToMetricsEnum(opt.metric));
    setTimeout(() => {
      this.fieldCtrl.setValue(opt.field);
      this.arlasFilterCtrl.setValue(JSON.stringify(opt.filter));
      this.updateValueAndValidity();
    }, 0);
  }

  public updateMetric() {
    this.getValueAsSet().delete(this.currentEditing);
    this.getValueAsSet().add({
      field: this.fieldCtrl.value,
      metric: String(this.metricCtrl.value).toLowerCase(),
      filter: JSON.parse(this.arlasFilterCtrl.value)
    });
    this.isUpdateState = false;
    this.metricCtrl.reset();
    this.fieldCtrl.reset();
    this.arlasFilterCtrl.setValue(JSON.stringify({}));
    this.updateValueAndValidity();
    this.markAsDirty();
  }

  public cancelUpdateMetric() {
    this.isUpdateState = false;
    this.updateValueAndValidity();
    this.metricCtrl.reset();
    this.fieldCtrl.reset();
    this.arlasFilterCtrl.setValue(JSON.stringify({}));
  }

  public filterAutocomplete(value?: string) {
    if (!!value) {
      this.autocompleteFilteredFields = this.metricFields.filter(o => o.label.indexOf(value) >= 0);
    } else {
      this.autocompleteFilteredFields = this.metricFields;
    }
  }

  public addMetric() {
    this.getValueAsSet().add({
      field: this.fieldCtrl.value,
      metric: String(this.metricCtrl.value).toLowerCase(),
      filter: JSON.parse(this.arlasFilterCtrl.value)
    });
    this.updateValueAndValidity();
    this.fieldCtrl.reset();
    this.markAsDirty();
  }

  public removeMetric(metric: ComputeConfig) {
    this.getValueAsSet().delete(metric);
    this.updateValueAndValidity();
    this.markAsDirty();
  }

  public getValueAsSet = () => (this.value as Set<ComputeConfig>);

  public setCollectionFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>): void {
    this.collectionFields = collectionFieldsObs;
  }
}

// try to put in common with MetricWithFieldListFormControl
export class FieldWithSizeListFormControl extends ConfigFormControl {

  // TODO do not use validators, the fields look like in error
  public sizeCtrl = new FormControl<number>(10, Validators.required);
  public fieldCtrl = new FormControl('', [
    Validators.required,
    (c) => !!this.autocompleteFilteredFields && this.autocompleteFilteredFields.map(f => f.value).indexOf(c.value) >= 0 ?
      null : { validateField: { valid: false } }
  ]);
  public fields: Array<SelectOption>;
  public autocompleteFilteredFields: Array<SelectOption>;

  public constructor(
    formState: any,
    label: string,
    description: string,
    collectionFields: Observable<Array<CollectionField>>,
    optionalParams?: ControlOptionalParams
  ) {
    super(formState, label, description, optionalParams);
    toKeywordOptionsObs(collectionFields).subscribe(fields => {
      this.fields = fields;
      this.filterAutocomplete();
    });
    this.fieldCtrl.valueChanges.subscribe(v => this.filterAutocomplete(v));
    this.setValue(new Set());
    if (!this.optional) {
      // as the value is a set, if the control is required, an empty set should also be an error
      this.setValidators([
        (control) => !!control.value && Array.from(control.value).length > 0 ? null : { required: { valid: false } }
      ]);
    }
  }

  public filterAutocomplete(value?: string) {
    if (!!value) {
      this.autocompleteFilteredFields = this.fields.filter(o => o.label.indexOf(value) >= 0);
    } else {
      this.autocompleteFilteredFields = this.fields;
    }
  }

  public add() {
    this.getValueAsSet().add({ field: this.fieldCtrl.value, size: this.sizeCtrl.value });
    this.updateValueAndValidity();
    this.fieldCtrl.reset();
  }

  public remove(opt: { field: string; size: number; }) {
    this.getValueAsSet().delete(opt);
    this.updateValueAndValidity();
  }

  public getValueAsSet = () => (this.value as Set<{ field: string; size: number; }>);
}


export class UrlTemplateControl extends ConfigFormControl {
  public urlControl = new FormControl('');
  public fieldCtrl = new FormControl('', [
    Validators.required,
    (c) => !!this.autocompleteFilteredFields && this.autocompleteFilteredFields.map(f => f.value).indexOf(c.value) >= 0 ?
      null : { validateField: { valid: false } }
  ]);
  public fields: Array<SelectOption>;
  public autocompleteFilteredFields: Array<SelectOption>;
  public isFieldFlat;
  public showInsertButton = true;

  public constructor(
    formState: any,
    label: string,
    description: string,
    collectionFields: Observable<Array<CollectionField>>,
    flat: boolean,
    optionalParams?: ControlOptionalParams
  ) {
    super(formState, label, description, optionalParams);
    toNumericOrDateOrKeywordOrTextObs(collectionFields).subscribe(fields => {
      this.fields = fields;
      this.filterAutocomplete();
    });
    this.isFieldFlat = flat;
    this.fieldCtrl.valueChanges.subscribe(v => this.filterAutocomplete(v));
    this.setValue('');
    if (!this.optional) {
      // as the value is a set, if the control is required, an empty set should also be an error
      this.setValidators([
        (control) => !!control.value && Array.from(control.value).length > 0 ? null : { required: { valid: false } }
      ]);
    }
  }

  public filterAutocomplete(value?: string) {
    if (!!value) {
      this.autocompleteFilteredFields = this.fields.filter(o => o.label.indexOf(value) >= 0);
    } else {
      this.autocompleteFilteredFields = this.fields;
    }
  }

  public add() {
    this.setValue(this.getValue().concat('{').concat(this.fieldCtrl.value).concat('}'));
    this.updateValueAndValidity();
    this.fieldCtrl.reset();
    this.showInsertButton = true;
  }

  public getValue(): string {
    return this.value as string;
  }
}

export class HuePaletteFormControl extends SelectFormControl {
  public constructor(
    formState: any,
    label: string,
    description: string,
    private hueOptions: Array<[number, number] | string>,
    optionalParams?: ControlOptionalParams) {
    super(
      formState,
      label,
      description,
      false,
      HuePaletteFormControl.toHslOptions(hueOptions),
      optionalParams);
  }

  public static toHslOptions(hues: Array<[number, number] | string>): Array<SelectOption> {
    return hues.map(h => ({
      value: h,
      label: HistogramUtils.getColor(0, h).toHslString() + ', ' + HistogramUtils.getColor(1, h).toHslString()
    }));
  }

  public getCurrentOption() {
    // JSON.stringifY to compare also array (as `[] === []` => false)
    return this.syncOptions.find(o => JSON.stringify(o.value) === JSON.stringify(this.value));
  }

}

export class HiddenFormControl extends ConfigFormControl {
  public data: Array<any>;
  public constructor(
    formState: any,
    // label can be used to display an error with this label, if it is not valid
    label?: string,
    optionalParams?: ControlOptionalParams,
    options?: Array<any>,
  ) {
    super(formState, label, null, optionalParams);
    this.data = options;
  }
}

export class SliderFormControl extends ConfigFormControl {
  public hasWarning = false;
  public warningMessage = '';
  public constructor(
    formState: any,
    label: string,
    description: string,
    public min: number,
    public max: number,
    public step: number,
    public ensureLessThan?: () => ConfigFormControl,
    public ensureGeaterThan?: () => ConfigFormControl,
    optionalParams?: ControlOptionalParams) {

    super(formState, label, description, optionalParams);
  }

  public checkLessThan(newValue: number) {
    const other = this.ensureLessThan();
    if (newValue > other.value) {
      other.setValue(newValue);
    }
  }

  public checkGreaterThan(newValue: number) {
    const other = this.ensureGeaterThan();
    if (newValue < other.value) {
      other.setValue(newValue);
    }
  }
}

export class MapFiltersControl extends ConfigFormControl {
  public constructor(
    public formState: any,
    label: string,
    description: string,
    optionalParams?: ControlOptionalParams) {
    super(formState, label, description, optionalParams || { optional: true });
  }
}

export class CollectionsUnitsControl extends ConfigFormControl {
  public constructor(
    public formState: any,
    label: string,
    description: string,
    optionalParams?: ControlOptionalParams) {
    super(formState, label, description, optionalParams || { optional: true });
  }

  public updateValueAndValidity(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    if (!!this.value) {
      this.markAllAsTouched();
      if (this.statusChanges) {
        this.setErrors(null);
      }
      (this.value as FormArray).controls.forEach(c => {
        c.markAllAsTouched();
        updateValueAndValidity(c);
        if (c.invalid) {
          this.setErrors({ empty: true });
        }
      });
    }
  }
}

export class InputFormControl extends ConfigFormControl {
  public constructor(
    formState: any,
    label: string,
    description: string,
    public inputType: string = 'text',
    optionalParams?: ControlOptionalParams,
    public ensureLessThan?: () => ConfigFormControl,
    public ensureGeaterThan?: () => ConfigFormControl) {
    super(formState, label, description, optionalParams);
  }

  public checkLessThan(newValue: number) {
    const other = this.ensureLessThan();
    if (newValue > other.value) {
      other.setValue(newValue);
    }
  }

  public checkGreaterThan(newValue: number) {
    const other = this.ensureGeaterThan();
    if (newValue < other.value) {
      other.setValue(newValue);
    }
  }
}

export class TitleInputFormControl extends InputFormControl {
  public inputAim = 'title';
  public constructor(
    formState: any,
    label: string,
    description: string,
    public inputType: string = 'text',
    optionalParams?: ControlOptionalParams) {
    super(formState, label, description, 'text', optionalParams);
  }
}

export class IconFormControl extends ConfigFormControl {
}

export class ColorFormControl extends ConfigFormControl {
}

/**
 * Display a preview of color(s).
 * Expects as value:
 * - an Array<ProportionedValues>
 * - or a single color
 */
export class ColorPreviewFormControl extends ConfigFormControl {

  public constructor(label: string, optionalParams?: ControlOptionalParams) {
    super(null, label, null, optionalParams || { optional: true });
  }

  public isMultiColors = () => Array.isArray(this.value);

  public getPaletteGradients() {
    const palette = this.value as Array<ProportionedValues>;
    const min = Math.min(...palette.map(pv => pv.proportion));
    const max = Math.max(...palette.map(pv => pv.proportion));

    return palette.map(
      c => c.value + ' ' + (100 * (c.proportion - min) / (max - min)) + '%').join(',');
  }
}

export class ButtonFormControl extends ConfigFormControl {

  // disabled state of the button itself, not of the form control
  // ButtonFormControl disabled <=> not displayed, button disabled <=> displayed but disabled
  public disabledButton = false;

  // TODO remove formstate?
  public constructor(
    formState: any,
    label: string,
    description: string,
    public callback: () => void,
    public disabledButtonMessage?: string,
    optionalParams?: ControlOptionalParams) {
    super(formState, label, description, optionalParams || { optional: true });
  }
}

export class TextareaFormControl extends ConfigFormControl {

  public constructor(
    formState: any,
    label: string,
    description: string,
    public nbRows?: number,
    optionalParams?: ControlOptionalParams
  ) {
    super(formState, label, description, optionalParams);
  }
}
