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


@Pipe({
  name: 'squareKm',
  standalone: false
})
export class SquareKilometer implements PipeTransform {

  public transform(a: number) {
    const oneSquareKM = 1000000;
    return Math.round(a / oneSquareKM * 10) / 10;
  }
}

@Pipe({
  name: 'roundKm',
  standalone: false
})
export class RoundKilometer implements PipeTransform {

  public transform(a: number) {
    return Math.round(a * 10) / 10;
  }
}
