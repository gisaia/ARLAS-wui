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

import { Component, Input } from '@angular/core';
import { AoiEdition } from 'arlas-map';

@Component({
  selector: 'arlas-aoi-dimensions',
  templateUrl: './aoi-dimensions.component.html',
  standalone: false,
  styleUrls: ['./aoi-dimensions.component.scss']
})
export class AoiDimensionComponent {
  /**
   * @Input : Angular
   * Current dimensions of the AOI being edited
   */
  @Input() public aoiEdition: AoiEdition;

  public constructor() { }
}
