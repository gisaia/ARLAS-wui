import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ConfigFormGroup, SelectFormControl } from 'app/arlas-wui-customiser/models/config-form';
import { GEOMETRY_TYPE, MAP_LAYER_TYPE } from 'app/arlas-wui-customiser/models/layer-enums';
import { PROPERTY_SELECTOR_SOURCE, PROPERTY_TYPE } from 'app/arlas-wui-customiser/services/property-selector-form-builder/models';
import {
  PropertySelectorFormBuilderService, PropertySelectorFormGroup
} from 'app/arlas-wui-customiser/services/property-selector-form-builder/property-selector-form-builder.service';
import { valuesToOptions } from 'app/arlas-wui-customiser/utils/tools';

export class GeometricFormControls {
  public shape: SelectFormControl;
}

export class LayerStyleGeometricForm extends ConfigFormGroup {
  public customControls = new GeometricFormControls();

  public constructor(
    layerType: MAP_LAYER_TYPE,
    geometryTypes: Array<GEOMETRY_TYPE>
  ) {
    super();
    this.withTitle(marker('Shape'))
      .withControl('shape', new SelectFormControl(
        '',
        marker('geometry ' + layerType + ' shape'),
        marker('geometry ' + layerType + ' shape description'),
        false,
        valuesToOptions(geometryTypes),
      ));

    this.customControls.shape = this.controls['shape'] as SelectFormControl;
  }
};

export class FillFormControls {
  public opacity: PropertySelectorFormGroup;
  public color: PropertySelectorFormGroup;
}

export class LayerStyleFillForm extends ConfigFormGroup {
  public customControls = new FillFormControls();

  public constructor(
    isAggregated: boolean,
    collection: string,
    layerType: MAP_LAYER_TYPE,
    private propertySelectorFormBuilder: PropertySelectorFormBuilderService
  ) {
    super();
    this.withTitle(marker('Fill geometry'))
      .withControl('opacity', this.propertySelectorFormBuilder.build(
        PROPERTY_TYPE.number,
        'opacity',
        [
          PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
        ],
        isAggregated,
        collection,
        marker('opacity description')
      ))
      .withControl('color', this.propertySelectorFormBuilder.build(
        PROPERTY_TYPE.color,
        'color',
        [
          PROPERTY_SELECTOR_SOURCE.fix_color, PROPERTY_SELECTOR_SOURCE.interpolated, PROPERTY_SELECTOR_SOURCE.generated,
          PROPERTY_SELECTOR_SOURCE.manual, PROPERTY_SELECTOR_SOURCE.provided_color
        ],
        isAggregated,
        collection,
        marker('property color ' + (layerType === MAP_LAYER_TYPE.CLUSTER ? layerType : '') + ' description'),
        // geometryTypes.indexOf(GEOMETRY_TYPE.heatmap) >= 0 ? () => this.geometryType : undefined
      ));

    this.customControls.opacity = this.controls['opacity'] as PropertySelectorFormGroup;
    this.customControls.color = this.controls['color'] as PropertySelectorFormGroup;
  }
};
