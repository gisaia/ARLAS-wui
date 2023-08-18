import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SelectFormControl, ConfigFormGroup } from '../../models/config-form';
import { LINE_TYPE, MAP_LAYER_TYPE, GEOMETRY_TYPE } from '../../models/layer-enums';
import { PROPERTY_TYPE, PROPERTY_SELECTOR_SOURCE } from '../../services/property-selector-form-builder/models';
import {
  PropertySelectorFormGroup,
  PropertySelectorFormBuilderService
} from '../../services/property-selector-form-builder/property-selector-form-builder.service';
import { valuesToOptions } from '../../utils/tools';


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

export class StrokeFormControls {
}

// Utilisation de différentes subclass ? Une classe gérée partiellement
// Discriminator en Angular ?
export class LineStrokeFormControls extends StrokeFormControls{
  public lineType: SelectFormControl;
  public lineWidth: PropertySelectorFormGroup;
}

export class LayerStyleStrokeForm extends ConfigFormGroup {
  public customControls: StrokeFormControls;

  public constructor() {
    super();
    this.withTitle(marker('Stroke'));
  }

  public initForm(
    geometryType: string,
    isAggregated: boolean,
    collection: string,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService
  ) {
    switch (geometryType) {
      case GEOMETRY_TYPE.line: {
        this.withControl('lineType', new SelectFormControl(
          LINE_TYPE.solid,
          marker('line type'),
          marker('line type description'),
          false,
          [
            { value: LINE_TYPE.solid, label: marker('Solid') + ' ( ━ ) ' },
            { value: LINE_TYPE.dashed, label: marker('Dashed') + ' ( - - - )' },
            { value: LINE_TYPE.dotted, label: marker('Dotted') + ' ( • • • )' },
            { value: LINE_TYPE.mixed, label: marker('Mixed') + ' ( - • - )' }
          ]));
          // .withControl('lineWidth', this.propertySelectorFormBuilder.build(
          //   PROPERTY_TYPE.number,
          //   'width',
          //   [
          //     PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          //   ],
          //   isAggregated,
          //   collection,
          //   marker('property width description')
          // ));
        this.customControls = new LineStrokeFormControls();
        (this.customControls as LineStrokeFormControls).lineType = this.controls['lineType'] as SelectFormControl;
        break;
      }
      default: {
        console.error('Not implemented');
      }
    }
  }
}
