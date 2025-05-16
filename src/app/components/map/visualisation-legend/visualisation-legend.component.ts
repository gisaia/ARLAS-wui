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

import { KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { CogLegendComponent } from 'arlas-web-components';
import { debounceTime } from 'rxjs';
import { CogService } from '../../../services/cog.service';

export interface CogLegendData {
  url: string;
  name: string;
  minimum?: number;
  maximum?: string;
}


@Component({
  selector: 'arlas-visualisation-legend',
  standalone: true,
  imports: [
    KeyValuePipe,
    CogLegendComponent
  ],
  templateUrl: './visualisation-legend.component.html',
  styleUrl: './visualisation-legend.component.scss'
})
export class VisualisationLegendComponent {
  public rasterHovered = new Map<string, CogLegendData>();

  /** Width of the colormap for the legend component */
  public colormapWidth = input<number>(100);

  private readonly cogService = inject(CogService);
  private readonly http = inject(HttpClient);

  public constructor() {
    this.cogService.hoverCogChange.pipe(debounceTime(100)).subscribe(() => {
      const uniqueIds = this.cogService.getHoveredCogs();

      // Reset raster hovered if none were hovered
      if (uniqueIds.size === 0) {
        this.rasterHovered.clear();
      }

      // Remove excess keys
      Array.from(this.rasterHovered.keys()).forEach(k => {
        if (!uniqueIds.has(k)) {
          this.rasterHovered.delete(k);
        }
      });

      // For new keys, process them to get legend url
      Array.from(uniqueIds.values()).filter(id => !this.rasterHovered.has(id))
        .forEach(id => {
          // Currently, we only generate a legend for the titler protocol
          const dataGroup = this.cogService.visualisedCogs.get(id);
          if (dataGroup.protocol === 'titiler') {
            // Transform visualisation url into a legend url
            const queryParams = dataGroup.visualisationUrl.split('?', 2)[1];
            if (queryParams) {
              const colorMap = queryParams.split('&').find(p => p.startsWith('colormap_name'))?.split('=')[1];

              // If there is no colorMap, then we can't plot the legend
              if (colorMap) {
                const legendUrl = dataGroup.visualisationUrl.split('/cog/tiles/')[0] + '/colorMaps/'
                  + colorMap + '?format=png&width=' + this.colormapWidth();
                this.rasterHovered.set(id, {
                  url: legendUrl,
                  name: dataGroup.name
                });

                const statUrl = dataGroup.visualisationUrl.split('/tiles/')[0] + '/statistics?' + queryParams;
                this.http.get(statUrl).subscribe((r: any) => {
                  const bands: Array<[string, any]> = Object.entries(r);
                  // If there is one band => either an expression OR just one band in the TIF
                  if (bands.length === 1) {
                    this.rasterHovered.set(id, {
                      url: legendUrl,
                      name: dataGroup.name,
                      minimum: bands[0][1].min,
                      maximum: bands[0][1].max
                    });
                  }
                  // If there are multiple bands, can't have a colormap => internal error for titiler
                });
              }
            }
          }
        });
    });
  }
}
