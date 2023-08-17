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

export enum GEOMETRY_TYPE {
  fill = 'fill',
  line = 'line',
  circle = 'circle',
  heatmap = 'heatmap',
  label = 'label'
}

export enum MAP_LAYER_TYPE {
  CLUSTER = 'cluster',
  FEATURE = 'feature',
  FEATURE_METRIC = 'feature-metric'
}

export enum LAYER_MODE {
  features = 'Features',
  cluster = 'Cluster',
  featureMetric = 'Feature Metric'
}

export const NORMALIZED = 'normalized';
export const ARLAS_ID = 'arlas_id:';

export enum CLUSTER_GEOMETRY_TYPE {
  aggregated_geometry = 'aggregated_geometry',
  raw_geometry = 'raw_geometry'
}

export enum LABEL_ALIGNMENT {
  bottom = 'bottom',
  top = 'top',
  center = 'center',
  right = 'right',
  left = 'left'
}

export enum LABEL_PLACEMENT {
  point = 'point',
  line = 'line',
  line_center = 'line-center'
}

export enum LINE_TYPE {
  solid = 'solid',
  dashed = 'dashed',
  dotted = 'dotted',
  mixed = 'mixed'
}

export const LINE_TYPE_VALUES: Map<string, Array<number>> = new Map([
  ['dashed', [2, 5]],
  ['dotted', [0.1, 5]],
  ['mixed', [5, 5, 0.1, 5]]
]);
