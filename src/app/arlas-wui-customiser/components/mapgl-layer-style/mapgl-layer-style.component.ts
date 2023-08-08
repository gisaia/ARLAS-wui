import { Component, Input, OnInit } from '@angular/core';
import { ConfigFormGroup, SelectFormControl } from '../../models/config-form';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { valuesToOptions } from '../../utils/tools';
import { GEOMETRY_TYPE, MAP_LAYER_TYPE } from '../../models/geometry';
import { PropertySelectorFormBuilderService } from '../../services/property-selector-form-builder/property-selector-form-builder.service';
import { PROPERTY_SELECTOR_SOURCE, PROPERTY_TYPE } from '../../services/property-selector-form-builder/models';

@Component({
  selector: 'arlas-mapgl-layer-style',
  templateUrl: './mapgl-layer-style.component.html',
  styleUrls: ['./mapgl-layer-style.component.scss']
})
export class MapglLayerStyleComponent implements OnInit {

  // For now, we will limit to features
  public layerType: MAP_LAYER_TYPE;

  // Will be determined programatically depending on the layerType
  /** Available geometry types for this type of layer */
  public geometryTypes = [GEOMETRY_TYPE.circle, GEOMETRY_TYPE.line, GEOMETRY_TYPE.fill, GEOMETRY_TYPE.label];

  @Input() public layerStyle: mapboxgl.Layer;

  public geometryForm = new ConfigFormGroup();
  public fillForm = new ConfigFormGroup();
  public strokeForm: ConfigFormGroup;

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
    }

    this.geometryForm
      .withTitle(marker('Shape'))
      .withControl('shape', new SelectFormControl(
        '',
        marker('geometry ' + this.layerType + ' shape'),
        marker('geometry ' + this.layerType + ' shape description'),
        false,
        valuesToOptions(this.geometryTypes),
      ));

    this.fillForm
      .withTitle(marker('Fill geometry'))
      .withControl('opacity', this.propertySelectorFormBuilder.build(
        PROPERTY_TYPE.number,
        'opacity',
        [
          PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
        ],
        // isAggregated is false as of now since we focus on feature layers
        false,
        this.layerStyle.metadata.collection,
        marker('opacity description')
      ));

    this.initForm();
    this.resetOnGeometryTypeChange();
  }

  /**
   * Retrieve information from the layer style to populate the form
   */
  public initForm() {
    this.geometryForm.controls['geometryType'].setValue(this.layerStyle.type);
  }

  private resetOnGeometryTypeChange() {
    // Create a subscribe of the valueChanges of the geometryType control to reinit the others
  }
}
