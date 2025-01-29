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

import { Pipe, PipeTransform } from '@angular/core';
import { ResultListContributor } from 'arlas-web-contributors';
import { ResultlistService } from '../services/resultlist.service';

@Pipe({
  name: 'getResultlistConfig',
  standalone: false
})
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class GetResultlistConfigPipe<L, S, M> implements PipeTransform {

  public constructor(private readonly resultlistService: ResultlistService<L, S, M>) { }

  public transform(resultlistContributor: ResultListContributor): any {
    return this.resultlistService.resultlistConfigPerContId.get(resultlistContributor?.identifier);
  }

}
