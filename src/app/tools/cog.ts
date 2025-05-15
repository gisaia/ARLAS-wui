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

import { ItemDataType, VisualisationInterface } from 'arlas-web-components';

export interface VisualisationPreview {
    visualisation: VisualisationInterface;
    preview: string;
    idx: number;
}


function getValueOrFirstArrayValue(data: Map<string, ItemDataType>, flattenedField: string) {
  if (data[flattenedField] !== undefined) {
    return data[flattenedField];
  }
  return data[flattenedField + '_0'];
}

/**
 * Replace in a template url the fields by getting the corresponding value from a Hit
 */
export function flattenedMatchAndReplace(data: Map<string, ItemDataType>, template: string) {
  let replaced = template;
  // Regex is more secured by checking that we don't match if there are multiple '{' in a row
  template.match(/{([^{]+?)}/g)?.forEach(t => {
    const flattenedKey: string = t.replace('{', '').replace('}', '').replace('.', '_');
    const value = getValueOrFirstArrayValue(data, flattenedKey);
    if (value !== undefined) {
      replaced = replaced.replace(t, value.toString());
    }
  });
  return replaced;
}


/**
 * Based in a visualisation url of a data group and on the data of the corresponding item,
 * generate the titiler preview url by replacing the fields that need replacing
 */
export function getTitilerPreviewUrl(visualisationUrl: string, itemData: Map<string, ItemDataType>) {
  const [baseUrl, path] = visualisationUrl.split('/tiles/', 2);

  // Keep all query parameters but buffer and padding
  const queryParams = path.split('?', 2)[1].split('&')
    .filter(q => {
      const key = q.split('=', 2)[0];
      return key !== 'buffer' && key !== 'padding';
    });

  // Add height and width to match the size of the image
  queryParams.push('height=80');
  queryParams.push('width=80');

  const url = baseUrl + '/preview?' + queryParams.join('&');

  return flattenedMatchAndReplace(itemData, url);
}
