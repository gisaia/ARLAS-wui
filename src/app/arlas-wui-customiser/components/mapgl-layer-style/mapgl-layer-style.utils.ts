import { FormControl, FormGroup, Validators } from '@angular/forms';

export class LayerStyleGeometricForm {

};

export interface LayerStyleFill {
    opacity: FormControl<number> | InterpolatedFieldNumericForm;
    color: FormControl<string> | InterpolatedFieldColorForm;
};

// Form for a field first of all
// We want to be able to cutomize one field, then one section, then the whole style.
// For one field, we need to be able to switch between a fix or interpolated field (minus the color)
// So, the goal is to create a form that allows that -> PropertySelectorForm


export class LayerStyleFillForm extends FormGroup<LayerStyleFill> {

};

export class LayerStyleStrokeForm {

};


