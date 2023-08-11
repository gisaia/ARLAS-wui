/* eslint-disable max-len */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ConfigFormControl, ConfigFormGroup } from '../../models/config-form';
import { GEOMETRY_TYPE, LAYER_MODE, LINE_TYPE, LINE_TYPE_VALUES, MAP_LAYER_TYPE, NORMALIZED } from '../../models/layer-enums';
import {
  PropertySelectorFormBuilderService, PropertySelectorFormGroup
} from '../../services/property-selector-form-builder/property-selector-form-builder.service';
import { MapImportService } from 'app/arlas-wui-customiser/services/map-import/map-import.service';
import { Layer, Paint } from 'app/arlas-wui-customiser/models/layer';
import { LayerStyleFillForm, LayerStyleGeometricForm } from './mapgl-layer-style.utils';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LayerSourceConfig, ColorConfig, getSourceName } from 'arlas-web-contributors';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from 'app/arlas-wui-customiser/services/property-selector-form-builder/models';
import { KeywordColor, OTHER_KEYWORD } from '../dialog-color-table/models';
import { ArlasColorService } from 'arlas-web-components';

@Component({
  selector: 'arlas-mapgl-layer-style',
  templateUrl: './mapgl-layer-style.component.html',
  styleUrls: ['./mapgl-layer-style.component.scss']
})
export class MapglLayerStyleComponent implements OnInit, OnDestroy {

  // For now, we will limit to features
  public layerType: MAP_LAYER_TYPE;

  // Will be determined programatically depending on the layerType
  /** Available geometry types for this type of layer */
  public geometryTypes = [GEOMETRY_TYPE.circle, GEOMETRY_TYPE.line, GEOMETRY_TYPE.fill, GEOMETRY_TYPE.label];

  @Input() public layerStyle: Layer;

  @Input() public layerSource;

  public geometryForm: LayerStyleGeometricForm;
  public fillForm: LayerStyleFillForm;
  public strokeForm: ConfigFormGroup;

  private toUnsubscribe: Array<Subscription> = new Array();

  public constructor(
    private propertySelectorFormBuilder: PropertySelectorFormBuilderService
  ) {
  }

  public ngOnInit(): void {
    switch (this.layerStyle.source.toString().split('-', 1)[0]) {
      case 'feature': {
        this.layerType = MAP_LAYER_TYPE.FEATURE;
        break;
      }
      default: {
        throw Error('Only support feature as of now');
      }
    }

    // Create a class for geometryForm, fillForm etc
    this.geometryForm = new LayerStyleGeometricForm(this.layerType, this.geometryTypes);

    this.fillForm = new LayerStyleFillForm(
      /** we only consider features layer as of now */ false,
      this.layerStyle.metadata.collection, MAP_LAYER_TYPE.FEATURE, this.propertySelectorFormBuilder);

    this.initForm();
    this.resetOnGeometryTypeChange();
    this.updateControlsFromOtherControls(this.geometryForm);
    this.updateControlsFromOtherControls(this.fillForm);
    this.updateControlsFromOtherControls(this.strokeForm);

    [
      ...this.geometryForm.controlsRecursively,
      this.geometryForm,
      ...this.fillForm.controlsRecursively,
      this.fillForm,
      // ...this.strokeForm.controlsRecursively,
      // this.strokeForm
    ]
      .filter(c => c instanceof ConfigFormGroup || c instanceof ConfigFormControl)
      .forEach((c: ConfigFormGroup | ConfigFormControl) => {
        this.listenToOnDependencysChange(c, this.toUnsubscribe);
        /**
         * For the formgroup and all of its controls, register them to the dependencies.
         * In the way, each control has a list of the fields that depend on it.
         */
        if (!!c.dependsOn) {
          c.dependsOn().forEach(d => {
            d.dependantControls = d.dependantControls || [];
            if (d.dependantControls.indexOf(c) < 0) {
              d.dependantControls.push(c);
            }
          });
        }
      });
  }

  /**
   * Retrieve information from the layer style to populate the form
   */
  public initForm() {
    const layerValues = MapImportService.importLayerFg(this.layerStyle, this.layerSource, []);
    console.log(layerValues);
    this.geometryForm.customControls.shape.setValue(layerValues.geometryType);

    this.setPropertySelectorValues(this.fillForm.customControls.opacity, layerValues.opacity);
    console.log(this.fillForm.customControls.color);
    console.log(layerValues.colorFg);
    this.setPropertySelectorValues(this.fillForm.customControls.color, layerValues.colorFg);
  }

  public ngOnDestroy(): void {
    this.toUnsubscribe.forEach(u => u.unsubscribe());
  }

  private resetOnGeometryTypeChange() {
    // Create a subscribe of the valueChanges of the geometryType control to reinit the others
  }

  /**
   * Sets the values of a PropertySelectorFormGroup
   * @param propertySelector The form control to initialize
   * @param values The values of the form controls of a PropertySelectorFormGroup
   */
  private setPropertySelectorValues(propertySelector: PropertySelectorFormGroup, values: any) {
    // TODO: create an interface/class for the custom controls of PropertySelectorFormGroup to give that as an argument
    Object.keys(values).forEach(k => {
      // PropertySelector form controls are on multiple levels, some directly accessible through customControls
      if (!!propertySelector.customControls) {
        if ((propertySelector.customControls as Object)[k] instanceof ConfigFormControl) {
          (propertySelector.customControls as Object)[k].setValue(values[k]);
        } else {
          this.setPropertySelectorValues((propertySelector.customControls as Object)[k], values[k]);
        }
      } else if ((propertySelector as Object)[k] instanceof ConfigFormControl) {
        (propertySelector as Object)[k].setValue(values[k]);
      } else {
        console.log('What');
      }
    });
  }

  /**
   * For each ConfigFormControl/Group that depends on other fields (its value or its status),
   * update the field. It is also done by displaying a ConfigFormGroup
   */
  private updateControlsFromOtherControls(control: AbstractControl) {
    if (control instanceof ConfigFormControl) {
      if (!!control.dependsOn) {
        control.onDependencyChange(control, true);
      }
    } else if (control instanceof ConfigFormGroup) {
      if (!!control.dependsOn) {
        control.onDependencyChange(control, true);
      }
      if (control.status !== 'DISABLED') {
        // if form group is disabled, k
        Object.values(control.controls).forEach(c => this.updateControlsFromOtherControls(c));
      }
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(c => this.updateControlsFromOtherControls(c));
    }
  }

  /**
   * Watch all other controls that input control depends on to update itself
   */
  private listenToOnDependencysChange(control: ConfigFormControl | ConfigFormGroup, toUnsubscribe: Array<Subscription>) {
    if (!!control.dependsOn) {
      control.dependsOn().forEach(dep => {
        toUnsubscribe.push(dep.valueChanges.subscribe(v => {
          control.onDependencyChange(control);
        }));
      });
      // trigger on initial load for each control to be on its expected state against other controls
      control.onDependencyChange(control, true);
    }
  }

  public exportLayerStyleConfig(layerSource: LayerSourceConfig, layerMode: LAYER_MODE, collection: string) {
    // this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.colorFg, layerMode);

    if (!!this.fillForm.customControls.opacity) {
      this.declareFieldsToLayerSource(layerSource, this.fillForm.customControls.opacity, layerMode);
    }

    // if (!!modeValues.styleStep.widthFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.widthFg, layerMode);
    // }

    // if (!!modeValues.styleStep.radiusFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.radiusFg, layerMode);
    // }

    // if (!!modeValues.styleStep.strokeColorFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.strokeColorFg, layerMode);
    // }

    // if (!!modeValues.styleStep.strokeWidthFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.strokeWidthFg, layerMode);
    // }

    // if (!!modeValues.styleStep.strokeOpacityFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.strokeOpacityFg, layerMode);
    // }

    // if (!!modeValues.styleStep.weightFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.weightFg, layerMode);
    // }
    // if (!!modeValues.styleStep.labelSizeFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelSizeFg, layerMode);
    // }
    // if (!!modeValues.styleStep.labelHaloColorFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelHaloColorFg, layerMode);
    // }
    // if (!!modeValues.styleStep.labelHaloBlurFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelHaloBlurFg, layerMode);
    // }
    // if (!!modeValues.styleStep.labelHaloWidthFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelHaloWidthFg, layerMode);
    // }
    // if (!!modeValues.styleStep.labelRotationFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelRotationFg, layerMode);
    // }
    // if (!!modeValues.styleStep.labelContentFg) {
    //   this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelContentFg, layerMode);
    // }

    layerSource.source = getSourceName(layerSource) + '-' + collection;
    return layerSource;
  }

  public getLayerPaint(mode: LAYER_MODE, colorService: ArlasColorService, taggableFields?: Set<string>): Paint {
    const paint: Paint = {};
    // const color = this.getMapProperty(this.fillForm.customControls.colorFg, mode, colorService, taggableFields);
    const opacity = this.getMapProperty(this.fillForm.customControls.opacity.value, mode, colorService, taggableFields);
    switch (this.geometryForm.customControls.shape.value) {
      case GEOMETRY_TYPE.fill: {
        paint['fill-opacity'] = opacity;
        paint['fill-color'] = this.layerStyle.paint['fill-color']; // color;
        break;
      }
      case GEOMETRY_TYPE.line: {
        paint['line-opacity'] = opacity;
        paint['line-color'] = this.layerStyle.paint['line-color']; // color
        // eslint-disable-next-line max-len
        paint['line-width'] = this.layerStyle.paint['line-width']; // this.getMapProperty(modeValues.styleStep.widthFg, mode, colorService, taggableFields);
        paint['line-dasharray'] = this.layerStyle.paint['line-dasharray'];
        // const lineType = modeValues.styleStep.lineType;
        // if (lineType !== LINE_TYPE.solid) {
        //   paint['line-dasharray'] = LINE_TYPE_VALUES.get(lineType);
        // } else {
        //   delete paint['line-dasharray'];
        // }
        break;
      }
      case GEOMETRY_TYPE.circle: {
        paint['circle-opacity'] = opacity;
        paint['circle-color'] = this.layerStyle.paint['circle-color']; // color;
        paint['circle-radius'] = this.layerStyle.paint['circle-radius']; // this.getMapProperty(modeValues.styleStep.radiusFg, mode, colorService, taggableFields);
        paint['circle-stroke-width'] = this.layerStyle.paint['circle-stroke-width']; // this.getMapProperty(modeValues.styleStep.strokeWidthFg, mode, colorService, taggableFields);
        // TODO: add below two attributes to Paint interface
        paint['circle-stroke-color'] = this.layerStyle.paint['circle-stroke-color']; // this.getMapProperty(modeValues.styleStep.strokeColorFg, mode, colorService, taggableFields);
        paint['circle-stroke-opacity'] = this.layerStyle.paint['circle-stroke-opacity']; // this.getMapProperty(modeValues.styleStep.strokeOpacityFg,
        //  mode, colorService, taggableFields);
        break;
      }
      case GEOMETRY_TYPE.heatmap: {
        paint['heatmap-color'] = this.layerStyle.paint['heatmap-color']; // color;
        paint['heatmap-opacity'] = opacity;
        paint['heatmap-intensity'] = this.layerStyle.paint['heatmap-intensity']; // this.getMapProperty(modeValues.styleStep.intensityFg, mode, colorService, taggableFields);
        paint['heatmap-weight'] = this.layerStyle.paint['heatmap-weight']; // this.getMapProperty(modeValues.styleStep.weightFg, mode, colorService, taggableFields);
        paint['heatmap-radius'] = this.layerStyle.paint['heatmap-radius']; // this.getMapProperty(modeValues.styleStep.radiusFg, mode, colorService, taggableFields);
        break;
      }
      case GEOMETRY_TYPE.label: {
        paint['text-color'] = this.layerStyle.paint['text-color']; // color;
        paint['text-opacity'] = opacity;
        paint['text-halo-color'] = this.layerStyle.paint['text-halo-color']; // this.getMapProperty(modeValues.styleStep.labelHaloColorFg, mode, colorService, taggableFields);
        paint['text-halo-width'] = this.layerStyle.paint['text-halo-width']; // this.getMapProperty(modeValues.styleStep.labelHaloWidthFg, mode, colorService, taggableFields);
        paint['text-halo-blur'] = this.layerStyle.paint['text-halo-blur']; // this.getMapProperty(modeValues.styleStep.labelHaloBlurFg, mode, colorService, taggableFields);
        paint['text-translate'] = this.layerStyle.paint['text-translate']; // [+modeValues.styleStep.labelOffsetFg.dx, +modeValues.styleStep.labelOffsetFg.dy];

        break;
      }
    }
    return paint;
  }

  // fgValues has to be the values of the customControls of a PropertySelector
  public getMapProperty(fgValues: any, mode: LAYER_MODE, colorService: ArlasColorService, taggableFields?: Set<string>) {
    console.log(fgValues);
    switch (fgValues.propertySource) {
      case PROPERTY_SELECTOR_SOURCE.fix_color:
        return fgValues.propertyFixColor;
      case PROPERTY_SELECTOR_SOURCE.fix_slider:
        return +fgValues.propertyFixSlider;
      case PROPERTY_SELECTOR_SOURCE.fix_input:
        return fgValues.propertyFixInput;
      case PROPERTY_SELECTOR_SOURCE.provided_color:
        return this.getArray(fgValues.propertyProvidedColorFieldCtrl);
      case PROPERTY_SELECTOR_SOURCE.provided_field_for_agg:
        let suffix = '';
        if (fgValues.propertyProvidedFieldAggFg.propertyShortFormatCtrl) {
          suffix = ':_arlas__short_format';
        }
        return this.getArray(fgValues.propertyProvidedFieldAggFg.propertyProvidedFieldAggCtrl + suffix);
      case PROPERTY_SELECTOR_SOURCE.provided_field_for_feature:
      case PROPERTY_SELECTOR_SOURCE.provided_numeric_field_for_feature:
        let featureSuffix = '';
        if (fgValues.propertyProvidedFieldFeatureFg.propertyShortFormatCtrl) {
          featureSuffix = ':_arlas__short_format';
        }
        return this.getArray(fgValues.propertyProvidedFieldFeatureFg.propertyProvidedFieldFeatureCtrl + featureSuffix);
      case PROPERTY_SELECTOR_SOURCE.generated:
        return this.getArray(fgValues.propertyGeneratedFieldCtrl + '_arlas__color');
      case PROPERTY_SELECTOR_SOURCE.manual:
        const otherKC = (fgValues.propertyManualFg.propertyManualValuesCtrl as Array<KeywordColor>)
          .find(kc => kc.keyword === OTHER_KEYWORD);
        // always keep OTHER_KEYWORD at the end of the list
        const manualValues = !otherKC ? (fgValues.propertyManualFg.propertyManualValuesCtrl as Array<KeywordColor>) :
          (fgValues.propertyManualFg.propertyManualValuesCtrl as Array<KeywordColor>)
            .filter(kc => kc.keyword !== OTHER_KEYWORD).concat(otherKC);
        const manualField = this.getFieldPath(fgValues.propertyManualFg.propertyManualFieldCtrl, taggableFields);
        return [
          'match',
          this.getArray(manualField)
        ].concat(
          manualValues.flatMap(kc => kc.keyword !== OTHER_KEYWORD ?
            [kc.keyword, colorService.getColor(kc.keyword)] : [kc.color])
        );
      case PROPERTY_SELECTOR_SOURCE.displayable_metric_on_field:
      case PROPERTY_SELECTOR_SOURCE.metric_on_field: {
        const countMetricFg = fgValues.propertyCountOrMetricFg;
        let field = '';
        if (countMetricFg.propertyCountOrMetricCtrl === 'count') {
          field = 'count';
        } else {
          field = `${countMetricFg.propertyFieldCtrl.replace(/\./g, '_')}_${countMetricFg.propertyMetricCtrl.toLowerCase()}_`;
        }
        if (countMetricFg.propertyShortFormatCtrl) {
          if (field === 'count') {
            field = `${field}_:_arlas__short_format`;
          } else {
            field = `${field}:_arlas__short_format`;
          }
        }
        return [
          'get',
          field
        ];
      }
      case PROPERTY_SELECTOR_SOURCE.interpolated: {
        const interpolatedValues = fgValues.propertyInterpolatedFg;
        let interpolatedColor: Array<string | Array<string | number>>;
        const getField = () =>
          (interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'metric')
            ? interpolatedValues.propertyInterpolatedFieldCtrl + '_' +
            (interpolatedValues.propertyInterpolatedMetricCtrl as string).toLowerCase() + '_' :
            interpolatedValues.propertyInterpolatedFieldCtrl;

        if (mode !== LAYER_MODE.features && interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'count') {
          // for types FEATURE-METRIC and CLUSTER, if we interpolate by count
          interpolatedColor = [
            'interpolate',
            ['linear'],
            ['get', 'count' + (!!interpolatedValues.propertyInterpolatedCountNormalizeCtrl ? `_:${NORMALIZED}` : '')]
          ];
        } else if (interpolatedValues.propertyInterpolatedNormalizeCtrl) {
          // otherwise if we normalize
          interpolatedColor = [
            'interpolate',
            ['linear'],
            this.getArray(
              getField()
                .concat(':' + NORMALIZED)
                .concat(interpolatedValues.propertyInterpolatedNormalizeByKeyCtrl ?
                  ':' + interpolatedValues.propertyInterpolatedNormalizeLocalFieldCtrl : ''))
          ];
        } else {
          // if we don't normalize
          interpolatedColor = [
            'interpolate',
            ['linear'],
            this.getArray(getField())
          ];
        }
        return interpolatedColor.concat((interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
          .flatMap(pc => [pc.proportion, pc.value]));
      }
      case PROPERTY_SELECTOR_SOURCE.heatmap_density: {
        const interpolatedValues = fgValues.propertyInterpolatedFg;
        const densityColor: Array<string | number | Array<string | number>> = [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(0, 0, 0, 0)',

        ];
        const hasNearZero = (interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
          .filter(pc => pc.proportion > 0 && pc.proportion <= 0.01).length > 0;
        return densityColor.concat((interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
          .filter(pc => hasNearZero ? pc.proportion > 0 : pc.proportion >= 0)
          .flatMap(pc => [(pc.proportion === 0 ? 0.000000000001 : pc.proportion), pc.value]));
      }
    }
  }

  private getArray(value: string) {
    return [
      'get',
      // flatten the fields
      value.replace(/\./g, '_')
    ];
  }

  public getFieldPath(field: string, taggableFields: Set<string>): string {
    return (taggableFields && taggableFields.has(field)) ? field + '.0' : field;
  }

  private declareFieldsToLayerSource(layerSource: LayerSourceConfig, layerValues: any, mode: LAYER_MODE) {
    switch (layerValues.propertySource) {
      case PROPERTY_SELECTOR_SOURCE.fix_color:
      case PROPERTY_SELECTOR_SOURCE.fix_slider:
      case PROPERTY_SELECTOR_SOURCE.fix_input:
        break;
      case PROPERTY_SELECTOR_SOURCE.provided_color: {
        const colorConfig: ColorConfig = {
          color: layerValues.propertyProvidedColorFieldCtrl
        };
        if (!!layerValues.propertyProvidedColorLabelCtrl) {
          colorConfig.label = layerValues.propertyProvidedColorLabelCtrl;
        }
        layerSource.provided_fields.push(colorConfig);
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.provided_field_for_agg: {
        let sorts = [];
        if (!layerSource.fetched_hits) {
          layerSource.fetched_hits = {
            sorts,
            fields: [],
            short_form_fields: []
          };
        }
        const fieldsSet = new Set(layerSource.fetched_hits.fields);
        const shortFieldsSet: Set<string> = new Set(layerSource.fetched_hits.short_form_fields);
        if (layerValues.propertyProvidedFieldAggFg && layerValues.propertyProvidedFieldAggFg.propertyProvidedFieldSortCtrl) {
          sorts = layerValues.propertyProvidedFieldAggFg.propertyProvidedFieldSortCtrl.split(',');
        }
        fieldsSet.add(layerValues.propertyProvidedFieldAggFg.propertyProvidedFieldAggCtrl);
        if (layerValues.propertyProvidedFieldAggFg.propertyShortFormatCtrl) {
          shortFieldsSet.add(layerValues.propertyProvidedFieldAggFg.propertyProvidedFieldAggCtrl);
        }
        layerSource.fetched_hits = {
          sorts,
          fields: Array.from(fieldsSet),
          short_form_fields: Array.from(shortFieldsSet)
        };
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.provided_field_for_feature:
      case PROPERTY_SELECTOR_SOURCE.provided_numeric_field_for_feature: {
        layerSource.include_fields.push(layerValues.propertyProvidedFieldFeatureFg.propertyProvidedFieldFeatureCtrl);
        if (layerValues.propertyProvidedFieldFeatureFg.propertyShortFormatCtrl) {
          layerSource.short_form_fields.push(layerValues.propertyProvidedFieldFeatureFg.propertyProvidedFieldFeatureCtrl);
        }
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.displayable_metric_on_field:
      case PROPERTY_SELECTOR_SOURCE.metric_on_field: {
        const countMetricFg = layerValues.propertyCountOrMetricFg;
        if (countMetricFg.propertyCountOrMetricCtrl === 'count') {
          layerSource.metrics.push({
            field: '',
            metric: 'count',
            normalize: false,
            short_format: !!countMetricFg.propertyShortFormatCtrl
          });
        } else {
          layerSource.metrics.push({
            field: countMetricFg.propertyFieldCtrl,
            metric: countMetricFg.propertyMetricCtrl.toString().toLowerCase(),
            normalize: false,
            short_format: !!countMetricFg.propertyShortFormatCtrl
          });
        }
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.generated: {
        layerSource.colors_from_fields.push(layerValues.propertyGeneratedFieldCtrl);
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.manual: {
        layerSource.include_fields.push(layerValues.propertyManualFg.propertyManualFieldCtrl);
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.interpolated: {
        const interpolatedValues = layerValues.propertyInterpolatedFg;
        if (mode === LAYER_MODE.features) {
          if (interpolatedValues.propertyInterpolatedNormalizeCtrl) {
            layerSource.normalization_fields.push(
              {
                on: interpolatedValues.propertyInterpolatedFieldCtrl,
                per: interpolatedValues.propertyInterpolatedNormalizeLocalFieldCtrl
              });
          } else {
            layerSource.include_fields.push(interpolatedValues.propertyInterpolatedFieldCtrl);
          }
        } else {
          if (interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'count') {
            layerSource.metrics.push({
              field: '',
              metric: 'count',
              normalize: !!interpolatedValues.propertyInterpolatedCountNormalizeCtrl
            });
          } else {
            layerSource.metrics.push({
              field: interpolatedValues.propertyInterpolatedFieldCtrl,
              metric: (interpolatedValues.propertyInterpolatedMetricCtrl).toString().toLowerCase(),
              normalize: !!interpolatedValues.propertyInterpolatedNormalizeCtrl
            });
          }
        }
        break;
      }
    }
  }
}
