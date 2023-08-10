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
import { Injectable } from '@angular/core';
import { KeywordColor, OTHER_KEYWORD } from '../../components/dialog-color-table/models';
import { Layer } from '../../models/layer';
import { NormalizationFieldConfig } from '../../models/config-form';
import { COUNT_OR_METRIC, PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '../property-selector-form-builder/models';
import { LayerMetadata, VisualisationSetConfig } from 'arlas-web-components';
import { ColorConfig, DEFAULT_FETCH_NETWORK_LEVEL, LayerSourceConfig, MetricConfig } from 'arlas-web-contributors';
import { ClusterAggType } from 'arlas-web-contributors/models/models';
import {
  CLUSTER_GEOMETRY_TYPE, GEOMETRY_TYPE, LINE_TYPE, LINE_TYPE_VALUES,
  LABEL_ALIGNMENT,
  LABEL_PLACEMENT, LAYER_MODE, NORMALIZED, ARLAS_ID
} from '../../models/layer-enums';

@Injectable({
  providedIn: 'root'
})
export class MapImportService {

  public constructor(
  ) { }

  public static removeLastcolor = (value) => value.substring(0, value.lastIndexOf('_arlas__color'));

  /**
   * Fills the values of a property selector form based on the input values
   * @param inputValues Values used for the field
   * @param propertySelectorValues Structure to fill a PropertySelectorFormGroup initial values
   * @param fixType Type of fix value (color vs numeric)
   * @param isAggregated Whether the field is aggregated
   * @param layerSource Source of the layer data
   */
  public static importPropertySelector(
    inputValues: any,
    propertySelectorValues: any,
    fixType: PROPERTY_SELECTOR_SOURCE,
    isAggregated: boolean,
    layerSource: LayerSourceConfig) {
    // Fix value
    if (typeof inputValues === 'string' || typeof inputValues === 'number') {
      propertySelectorValues.propertySource = fixType;
      if (fixType === PROPERTY_SELECTOR_SOURCE.fix_color) {
        propertySelectorValues.propertyFixColor = inputValues;
      } else if (fixType === PROPERTY_SELECTOR_SOURCE.fix_slider) {
        propertySelectorValues.propertyFixSlider = inputValues + '';
      }
    // Interpolated / Generated / Provided
    } else if (inputValues instanceof Array) {
      // Color fields
      if (inputValues.length === 2) {
        let field = (inputValues as Array<string>)[1];
        /** retro compatibility code: ARLAS 15 config */
        if (!field.endsWith('_arlas__color') && field.endsWith('_color')) {
          if (layerSource.provided_fields.filter((pf: ColorConfig) => pf.color.replace(/\./g, '_') === field).length === 1) {

          } else {
            field = field.replace('_color', '_arlas__color');
          }
        }
        /** end of retrocompatibility code */

        if (field.endsWith('_arlas__color') && layerSource.colors_from_fields) {
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.generated;
          propertySelectorValues.propertyGeneratedFieldCtrl = layerSource.colors_from_fields
            .find(f => f.replace(/\./g, '_') === this.removeLastcolor(field));
        } else {
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.provided_color;
          const colorProvidedField = layerSource.provided_fields.find((pf: ColorConfig) => pf.color.replace(/\./g, '_') === field);
          propertySelectorValues.propertyProvidedColorFieldCtrl = colorProvidedField.color;
          if (inputValues.length === 2) {
            propertySelectorValues.propertyProvidedColorLabelCtrl = colorProvidedField.label;
          }
        }
      // Color fields
      } else if (inputValues[0] === 'match') {
        this.importPropertySelectorManual(inputValues, propertySelectorValues, layerSource);
      // Numeric field
      } else if (inputValues[0] === 'interpolate') {
        this.importPropertySelectorInterpolated(inputValues, propertySelectorValues, isAggregated, layerSource);
      }
    }
  }

  public static importPropertySelectorForLabel(
    inputValues: any,
    propertySelectorValues: any,
    isAggregated: boolean,
    layerSource: LayerSourceConfig,
    fixType: PROPERTY_SELECTOR_SOURCE.fix_input | PROPERTY_SELECTOR_SOURCE.fix_slider,
    displayable: boolean,
    numeric: boolean) {
    if (typeof inputValues === 'string' || typeof inputValues === 'number') {
      propertySelectorValues.propertySource = fixType;
      if (fixType === PROPERTY_SELECTOR_SOURCE.fix_input) {
        propertySelectorValues.propertyFixInput = inputValues;
      } else if (fixType === PROPERTY_SELECTOR_SOURCE.fix_slider) {
        propertySelectorValues.propertyFixSlider = inputValues + '';
      }
    } else if (inputValues instanceof Array) {
      if (inputValues.length === 2) {
        const flatField = (inputValues as Array<string>)[1];
        if (isAggregated) {
          const isFetchedHits = !!layerSource.fetched_hits && !!layerSource.fetched_hits.fields
            && layerSource.fetched_hits.fields.length > 0;
          const hasMetricForLabels = !!layerSource.metrics && layerSource.metrics.filter(m => m.short_format !== undefined).length > 0;
          if (isFetchedHits) {
            const providedField = layerSource.fetched_hits.fields.find(f => f.replace(/\./g, '_') === flatField ||
              (f.replace(/\./g, '_') + ':_arlas__short_format') === flatField);
            propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.provided_field_for_agg;
            if (providedField) {
              propertySelectorValues.propertyProvidedFieldAggFg = {
                propertyProvidedFieldAggCtrl: providedField,
                propertyProvidedFieldSortCtrl: layerSource.fetched_hits.sorts.join(',')
              };
              if (flatField.includes(':_arlas__short_format') && !!layerSource.fetched_hits.short_form_fields) {
                propertySelectorValues.propertyProvidedFieldAggFg.propertyShortFormatCtrl = true;

              }
            }
          } else if (hasMetricForLabels) {
            const getFlatMetric = (m: MetricConfig) => {
              let flatMetric = '';
              if (m.metric === 'count') {
                flatMetric = 'count';
              } else {
                flatMetric = `${m.field.replace(/\./g, '_')}_${m.metric.toString().toLowerCase()}_`;
              }
              if (m.short_format) {
                if (flatMetric === 'count') {
                  flatMetric += `_:_arlas__short_format`;
                } else {
                  flatMetric += `:_arlas__short_format`;
                }
              }
              return flatMetric;
            };
            const metric = layerSource.metrics
              .filter(m => m.short_format !== undefined)
              .find(m => getFlatMetric(m) === flatField);
            if (!!metric) {
              propertySelectorValues.propertySource = displayable ? PROPERTY_SELECTOR_SOURCE.displayable_metric_on_field :
                PROPERTY_SELECTOR_SOURCE.metric_on_field;
              propertySelectorValues.propertyCountOrMetricFg = {
                propertyCountOrMetricCtrl: metric.metric === 'count' ? COUNT_OR_METRIC.COUNT : COUNT_OR_METRIC.METRIC,
                propertyMetricCtrl: metric.metric === 'count' ? undefined : metric.metric.toString().toUpperCase(),
                propertyFieldCtrl: metric.metric === 'count' ? undefined : metric.field,
                propertyShortFormatCtrl: metric.short_format
              };
            }
          }
        } else {
          const providedField = layerSource.include_fields.find(f => f.replace(/\./g, '_') === flatField ||
            (f.replace(/\./g, '_') + ':_arlas__short_format') === flatField);
          propertySelectorValues.propertySource = numeric ? PROPERTY_SELECTOR_SOURCE.provided_numeric_field_for_feature :
            PROPERTY_SELECTOR_SOURCE.provided_field_for_feature;
          propertySelectorValues.propertyProvidedFieldFeatureFg = {
            propertyProvidedFieldFeatureCtrl: providedField
          };
          if (flatField.includes(':_arlas__short_format') && layerSource.short_form_fields) {
            propertySelectorValues.propertyProvidedFieldFeatureFg.propertyShortFormatCtrl = true;

          }
        }
      } else if (inputValues[0] === 'interpolate') {
        this.importPropertySelectorInterpolated(inputValues, propertySelectorValues, isAggregated, layerSource);
      }
    }
  }

  public static importPropertySelectorManual(inputValues: any, propertySelectorValues: any, layerSource: LayerSourceConfig) {
    propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.manual;
    const keywordsAndColors = (inputValues.slice(2) as Array<string>);
    let manualField = '';
    if (layerSource.include_fields) {
      manualField = layerSource.include_fields.find(f => inputValues[1][1].includes(f.replace(/\./g, '_')));
      if (!manualField && layerSource.provided_fields) {
        const providedField = layerSource.provided_fields
          .filter(f => f.label).find(f => inputValues[1][1].includes(f.label.replace(/\./g, '_')));
        if (providedField) {
          manualField = providedField.label;
        } else {
          throw new Error('Cannot fetch ' + inputValues[1][1] + ' from layer_sources');
        }
      }
    } else {
      if (layerSource.provided_fields) {
        const providedField = layerSource.provided_fields
          .filter(f => f.label).find(f => inputValues[1][1].includes(f.label.replace(/\./g, '_')));
        if (providedField) {
          manualField = providedField.label;
        } else {
          throw new Error('Cannot fetch ' + inputValues[1][1] + ' from layer_sources');
        }
      }
    }
    propertySelectorValues.propertyManualFg = {
      // 'taggable_field_0' includes 'taggable.field'.replace(/\./g, '_')
      propertyManualFieldCtrl: manualField,
      propertyManualValuesCtrl: new Array<KeywordColor>()
    };
    for (let i = 0; i < keywordsAndColors.length - 1; i = i + 2) {
      propertySelectorValues.propertyManualFg.propertyManualValuesCtrl.push({
        keyword: keywordsAndColors[i] + '',
        color: keywordsAndColors[i + 1]
      });
    }

    propertySelectorValues.propertyManualFg.propertyManualValuesCtrl.push({
      keyword: OTHER_KEYWORD,
      color: keywordsAndColors.pop()
    }
    );
  }

  public static importPropertySelectorInterpolated(
    inputValues: any,
    propertySelectorValues: any,
    isAggregated: boolean,
    layerSource: LayerSourceConfig) {
    if ((inputValues[2] as Array<string>)[0] === 'heatmap-density') {
      propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.heatmap_density;
      propertySelectorValues.propertyInterpolatedFg = {};

    } else {
      propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.interpolated;
      const getValue = (inputValues[2] as Array<string>)[1];
      if (getValue.startsWith('count')) {
        propertySelectorValues.propertyInterpolatedFg = {
          propertyInterpolatedCountOrMetricCtrl: COUNT_OR_METRIC.COUNT,
          propertyInterpolatedCountNormalizeCtrl: getValue.endsWith('_:normalized')
        };

      } else {
        const isNormalize = getValue.split(':')[1] === NORMALIZED;
        propertySelectorValues.propertyInterpolatedFg = {
          propertyInterpolatedNormalizeCtrl: isNormalize,
          propertyInterpolatedNormalizeByKeyCtrl: isNormalize ? getValue.split(':').length === 3 : null,
        };
        if (isAggregated) {
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl = COUNT_OR_METRIC.METRIC;
          const findMetric = layerSource.metrics.find(m => {
            let flatMetric = m.field.replace(/\./g, '_') + '_' + m.metric.toString().toLowerCase() + '_';
            if (m.normalize) {
              flatMetric += ':normalized';
            }
            return flatMetric === getValue;
          });
          if (findMetric) {
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMetricCtrl = findMetric.metric.toString().toUpperCase();
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedFieldCtrl = findMetric.field;
          }
        } else {
          let field;
          if (isNormalize) {
            field = layerSource.normalization_fields
              .find((nf: NormalizationFieldConfig) => nf.on.replace(/\./g, '_') === getValue.split(':')[0]).on;
            if (getValue.split(':').length > 2) {
              const perfield = layerSource.normalization_fields
                .find((nf: NormalizationFieldConfig) => !!nf.per && nf.per.replace(/\./g, '_') === getValue.split(':')[2]).per;
              propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl = perfield;

            }
          } else {
            field = layerSource.include_fields.find(f => f.replace(/\./g, '_') === getValue);
          }
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedFieldCtrl = field;
        }
        if (!propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl) {
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl = inputValues[3];
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl = inputValues[inputValues.length - 2];
        }
      }
    }
    propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedValuesCtrl = new Array<ProportionedValues>();
    for (let i = 3; i < inputValues.length; i = i + 2) {
      propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedValuesCtrl.push({
        proportion: inputValues[i],
        value: inputValues[i + 1]
      });
    }
    if (propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl === COUNT_OR_METRIC.COUNT) {
      const interpolatedValues = propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedValuesCtrl;
      if (!!interpolatedValues && Array.isArray(interpolatedValues) && interpolatedValues.length > 0) {
        propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedCountValueCtrl =
          interpolatedValues[interpolatedValues.length - 1].proportion;
      }
    }
    const min = inputValues[4];
    const max = inputValues.pop();
    propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl = min === 0 ? '0' : min;
    propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl = max === 0 ? '0' : max;
  }

  // Need: method to import the values of the layer style based on the layer object
  // Could give all the info important like collection and other to fill the fields
  public static importLayerFg(
    layer: Layer,
    layerSource: LayerSourceConfig,
    visualisationSets: Array<VisualisationSetConfig>,
  ) {
    const type = layer.source.split('-')[0];
    // TODO extract type with toolkit, once it is available (contrary of `getSourceName`)
    const layerMode = layer.source.startsWith('feature-metric') ? LAYER_MODE.featureMetric :
      type === 'feature' ? LAYER_MODE.features :
        type === 'cluster' ? LAYER_MODE.cluster :
          null;
    if (layerSource.id.startsWith(ARLAS_ID)) {
      if (!layerSource.name) {
        layerSource.name = layerSource.id.split(ARLAS_ID)[1].split(':')[0];
      }
    } else {
      /** retro compatibility code: ARLAS 15 config */
      /** If we import a dashboard previous to 15.0.0
       * - the id was the name before so the layerSource.name takes the layerSource.id value
       * - the real id is prefixed with 'arlas_id:'+NAME+creationTimestamp
       * - apply this id changes to the layers list in visualisation set configuration
       */
      layerSource.name = layerSource.id;
      layerSource.id = ARLAS_ID + layerSource.name + ':' + Date.now();
      visualisationSets.forEach(vs => {
        vs.layers = vs.layers.map(l => {
          if (l === layerSource.name) {
            return layerSource.id;
          }
          return l;
        });
      });
      /** end of retrocompatibility code */
    }

    const isAggregated = layerMode !== LAYER_MODE.features;
    const values: any = {
      colorFg: {
      }
    };

    values.opacity = {};
    this.importPropertySelector(layer.paint[(layer.type === 'symbol' ? 'text' : layer.type) + '-opacity'], values.opacity,
      PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

    if (layer.type === GEOMETRY_TYPE.line.toString()) {
      values.widthFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-width'], values.widthFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

      if (!!layer.paint['line-dasharray']) {
        switch (layer.paint['line-dasharray'].toString()) {
          case LINE_TYPE_VALUES.get(LINE_TYPE.dashed).toString():
            values.lineType = LINE_TYPE.dashed;
            break;
          case LINE_TYPE_VALUES.get(LINE_TYPE.dotted).toString():
            values.lineType = LINE_TYPE.dotted;
            break;
          case LINE_TYPE_VALUES.get(LINE_TYPE.mixed).toString():
            values.lineType = LINE_TYPE.mixed;
            break;
          default:
            values.lineType = LINE_TYPE.solid;
        }
      } else {
        values.lineType = LINE_TYPE.solid;
      }

    } else if (layer.type === GEOMETRY_TYPE.circle.toString()) {
      values.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.radiusFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

      values.strokeWidthFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-width'], values.strokeWidthFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

      values.strokeColorFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-color'], values.strokeColorFg,
        PROPERTY_SELECTOR_SOURCE.fix_color, isAggregated, layerSource);

      values.strokeOpacityFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-opacity'], values.strokeOpacityFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
    } else if (layer.type === GEOMETRY_TYPE.heatmap.toString()) {
      values.intensityFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-intensity'], values.intensityFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      values.weightFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-weight'], values.weightFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      values.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.radiusFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
    } else if (layer.type === GEOMETRY_TYPE.fill.toString()) {
      if (!!layer.metadata && !!(layer.metadata as LayerMetadata).stroke) {
        values.strokeWidthFg = {};
        this.importPropertySelector((layer.metadata as LayerMetadata).stroke.width, values.strokeWidthFg,
          PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

        values.strokeColorFg = {};
        this.importPropertySelector((layer.metadata as LayerMetadata).stroke.color, values.strokeColorFg,
          PROPERTY_SELECTOR_SOURCE.fix_color, isAggregated, layerSource);

        values.strokeOpacityFg = {};
        this.importPropertySelector((layer.metadata as LayerMetadata).stroke.opacity, values.strokeOpacityFg,
          PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

      }
    }
    const colors = layer.paint[(layer.type === 'symbol' ? 'text' : layer.type) + '-color'];
    values.colorFg = {};
    this.importPropertySelector(colors, values.colorFg,
      PROPERTY_SELECTOR_SOURCE.fix_color, isAggregated, layerSource);
    if (layer.type === 'symbol') {
      values.labelSizeFg = {};
      values.labelRotationFg = {};
      values.labelContentFg = {};
      values.labelHaloColorFg = {};
      values.labelHaloBlurFg = {};
      values.labelHaloWidthFg = {};
      const size = layer.layout['text-size'];
      const content = layer.layout['text-field'];
      const haloColor = layer.paint['text-halo-color'];
      const haloBlur = layer.paint['text-halo-blur'];
      const haloWidth = layer.paint['text-halo-width'];
      const rotation = layer.layout['text-rotate'];
      const overlap = layer.layout['text-allow-overlap'];
      const alignment = layer.layout['text-anchor'];
      const placement = layer.layout['symbol-placement'];
      values.labelOverlapFg = !!overlap;
      this.importPropertySelector(size, values.labelSizeFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      this.importPropertySelectorForLabel(rotation, values.labelRotationFg, isAggregated, layerSource,
        PROPERTY_SELECTOR_SOURCE.fix_slider, /** dsplayable */ false, /** numeric */ true);
      this.importPropertySelectorForLabel(content, values.labelContentFg, isAggregated, layerSource,
        PROPERTY_SELECTOR_SOURCE.fix_input, /** dsplayable */ true, /** numeric */ false);
      this.importPropertySelector(haloColor, values.labelHaloColorFg,
        PROPERTY_SELECTOR_SOURCE.fix_color, isAggregated, layerSource);
      this.importPropertySelector(haloBlur, values.labelHaloBlurFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      this.importPropertySelector(haloWidth, values.labelHaloWidthFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      const offset = layer.paint['text-translate'];
      if (offset) {
        values.labelOffsetFg = {
          dx: offset[0] + '',
          dy: offset[1] + ''
        };
      }
      if (!!placement) {
        values.labelPlacementCtrl = placement;
      } else {
        values.labelPlacementCtrl = LABEL_PLACEMENT.point.toString();
      }
      if (!!alignment) {
        values.labelAlignmentCtrl = alignment;
      } else {
        values.labelAlignmentCtrl = LABEL_ALIGNMENT.center.toString();
      }
    }
    if (layerMode === LAYER_MODE.features) {
      this.importLayerFeatures(values, layer);
    } else if (layerMode === LAYER_MODE.featureMetric) {
      this.importLayerFeaturesMetric(values, layer, layerSource);
    } else if (layerMode === LAYER_MODE.cluster) {
      this.importLayerCluster(values, layer, layerSource);
    }

    // populate manual values FormArray
    // const manualValues = (((values || {}).colorFg || {}).propertyManualFg || {}).propertyManualValuesCtrl as Array<KeywordColor>;
    // (manualValues || []).forEach(kc =>
    //   typeFg.colorFg.addToColorManualValuesCtrl(kc));
    console.log(values);
    return values;
  }


  public static importLayerFeatures(
    values: any,
    layer: Layer
  ) {
    values.geometryType = layer.type === 'symbol' ? 'label' : layer.type;
    values.filter = layer.filter;

  }

  public static importLayerFeaturesMetric(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {
    this.importLayerFeatures(values, layer);
    /** retro compatibility code : migrate from [geometry_support] to [raw_geometry] */
    if (!!layerSource.geometry_support) {
      values.geometryStep.geometry = layerSource.geometry_support;
      values.geometryStep.featureMetricSort = null;
    } else {
      values.geometryStep.geometry = layerSource.raw_geometry.geometry;
      values.geometryStep.featureMetricSort = !!layerSource.raw_geometry.sort ? layerSource.raw_geometry.sort : null;
    }
    values.geometryStep.geometryId = layerSource.geometry_id;
    values.visibilityStep.networkFetchingLevel = layerSource.network_fetching_level !== undefined ?
      layerSource.network_fetching_level : DEFAULT_FETCH_NETWORK_LEVEL;
  }

  public static importLayerCluster(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {
    values.geometryStep.aggGeometry = layerSource.agg_geo_field;
    values.geometryStep.granularity = layerSource.granularity;
    values.geometryStep.aggType = layerSource.aggType ? layerSource.aggType : ClusterAggType.geohash;

    const isGeometryTypeRaw = !!layerSource.raw_geometry && Object.keys(layerSource.raw_geometry).length > 0;
    values.geometryStep.clusterGeometryType =
      isGeometryTypeRaw ? CLUSTER_GEOMETRY_TYPE.raw_geometry : CLUSTER_GEOMETRY_TYPE.aggregated_geometry;
    // To Import old dashboard before ARLAS 17
    if (!!layerSource.aggregated_geometry) {
      if (layerSource.aggregated_geometry === 'geohash') {
        layerSource.aggregated_geometry = 'cell';
      }
      if (layerSource.aggregated_geometry === 'geohash_center') {
        layerSource.aggregated_geometry = 'cell_center';
      }
    }
    values.geometryStep.aggregatedGeometry = !isGeometryTypeRaw ? layerSource.aggregated_geometry : null;
    values.geometryStep.rawGeometry = isGeometryTypeRaw ? layerSource.raw_geometry.geometry : null;
    values.geometryStep.clusterSort = isGeometryTypeRaw ? layerSource.raw_geometry.sort : null;
    values.visibilityStep.featuresMin = layerSource.minfeatures;
    values.styleStep.geometryType = layer.type === 'symbol' ? 'label' : layer.type;
    values.styleStep.filter = layer.filter;

  }
}
