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

import { ResultListContributor } from 'arlas-web-contributors';
import { SortEnum } from 'arlas-web-components';

export const DEFAULT_BASEMAP = {
  styleFile: 'http://demo.arlas.io:82/styles/positron/style.json',
  name: 'Positron'
};

// Should be in web components
export interface ResultListSort {
    fieldName: string;
    sortDirection: SortEnum;
    columnName?: string;
  }

/**
 * Fills the sortOutput dictionnary with how the result lists are sorted by default
 * @param resultlistContributors The list of ResultListContributors to consider
 * @param resultlistConfigs The list of configuration of the ResultList
 * @param sortOutput A map of how each ResultList is sorted
 * @returns The list of ResultListContributors that have a configuration
 */
export function setDefaultResultListColumnSort(
  resultlistContributors: Array<ResultListContributor>, resultlistConfigs: Array<any>,
  sortOutput: Map<string, ResultListSort>) {

  return resultlistContributors
    .filter(c => resultlistConfigs.some((rc) => c.identifier === rc.contributorId))
    .map(rlContrib => {
      (rlContrib as any).name = rlContrib.getName();
      const sortColumn = rlContrib.fieldsList.find(c => !!(c as any).sort && (c as any).sort !== '');
      if (!!sortColumn) {
        sortOutput.set(rlContrib.identifier, {
          columnName: sortColumn.columnName,
          fieldName: sortColumn.fieldName,
          sortDirection: (sortColumn as any).sort === 'asc' ? SortEnum.asc : SortEnum.desc
        });
      }
      return rlContrib;
    });
}
