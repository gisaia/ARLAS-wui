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

import { Expression, Filter, Search } from 'arlas-api';
import { ElementIdentifier } from 'arlas-web-components';
import { projType } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

export function isElementInViewport(el: HTMLElement) {
  if (el) {
    const rect = el.getBoundingClientRect();
    return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth));
  } else {
    return false;
  }
}


export function getItem(elementidentifier: ElementIdentifier, collection: string, collaborativeService: ArlasCollaborativesearchService) {
  const search: Search = {
    page: { size: 1 },
    form: { pretty: false, flat: true }
  };
  const expression: Expression = {
    field: elementidentifier.idFieldName,
    op: Expression.OpEnum.Eq,
    value: elementidentifier.idValue
  };
  const filterExpression: Filter = {
    f: [[expression]]
  };
  return collaborativeService.resolveHits(
    [projType.search, search], collaborativeService.collaborations,
    collection, null, filterExpression, true);
}
