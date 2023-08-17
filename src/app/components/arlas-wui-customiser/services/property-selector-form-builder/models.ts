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

export enum PROPERTY_SELECTOR_SOURCE {
    fix_color = 'Fix color',
    fix_slider = 'Fix slider',
    fix_input = 'Fix input',
    provided_color = 'Provided color',
    provided_field_for_feature = 'Provided field feature',
    provided_field_for_agg = 'Provided field agg',
    provided_numeric_field_for_feature = 'Provided numeric field feature',
    provided_numeric_field_for_agg = 'Provided numeric field agg',
    generated = 'Generated',
    manual = 'Manual',
    interpolated = 'Interpolated',
    displayable_metric_on_field = 'displayable metric on field',
    metric_on_field = 'metric on field',
    heatmap_density = 'Density'
}

export enum PROPERTY_TYPE {
    color,
    number,
    text
}

export interface ProportionedValues {
    proportion: number;
    value: string | number;
}

export enum COUNT_OR_METRIC {
    COUNT = 'count',
    METRIC = 'metric'
}
