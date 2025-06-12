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
import area from '@turf/area';
import bbox from '@turf/bbox';
import { Feature, lineString, Polygon } from '@turf/helpers';
import length from '@turf/length';
import { AoiDimensions } from 'arlas-map/lib/draw/draw.models';

@Pipe({
  name: 'aoiDimensions',
  standalone: true
})
export class AoiDimensionsPipe implements PipeTransform {

  public transform(feature: Feature<Polygon>): AoiDimensions {
    const a = this.calculateArea(feature);
    const wh = this.calculateEnvelopeDimension(feature);
    return {
      area: a,
      envelope: {
        width: wh[0],
        height: wh[1]
      },
      show: true
    };
  }

  /** Returns the area of the given feature */
  private calculateArea(feature: Feature<Polygon>): number {
    if (this.isArea(feature)) {
      return area(feature);
    }
    return 0;
  }

  /** Returns the width x height of the given feature's envelope */
  private calculateEnvelopeDimension(feature: Feature<Polygon>): [number, number] {
    if (this.isLine(feature)) {
      const [minX, minY, maxX, maxY] = bbox(feature);
      const verticalLine = lineString([[minX, minY], [minX, maxY]]);
      const horizontalLine = lineString([[minX, minY], [maxX, minY]]);
      return [length(horizontalLine), length(verticalLine)];
    }
    return [0, 0];
  }

  /** Checks if the given feature has enough coordinates to represent an area (polygon) */
  private isArea(feature: Feature<Polygon>) {
    const isGeometryDefined = !!feature && !!feature.geometry;
    const areCoordinatesDefined = isGeometryDefined && !!feature.geometry.coordinates;
    if (areCoordinatesDefined) {
      const coordinates = feature.geometry.coordinates;
      const isArea = coordinates.length === 1 && coordinates[0].length > 3;
      return isArea;
    }
    return false;
  }

  /** Checks if the given feature has enough coordinates to represent a line */
  private isLine(feature: Feature<Polygon>) {
    const isGeometryDefined = !!feature && !!feature.geometry;
    const areCoordinatesDefined = isGeometryDefined && !!feature.geometry.coordinates;
    if (areCoordinatesDefined) {
      const coordinates = feature.geometry.coordinates;
      const isLine = coordinates.length === 1 && coordinates[0].length > 1;
      return isLine;
    }
    return false;
  }

}
