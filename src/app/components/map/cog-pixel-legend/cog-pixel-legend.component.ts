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

import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PROTECTED_REQUEST_HEADER, ShortenNumberPipe } from 'arlas-web-components';
import { CogService } from '../../../services/cog.service';

interface HoveredCogValue {
  band: string;
  value: number;
}

/** Pattern in titiler COG visualisation to fetch a XYZ tile */
const tilePattern = 'tiles/WebMercatorQuad/{z}/{x}/{y}.png';

/**
 * Displays the values of the pixel of a hovered COG
 */
@Component({
  selector: 'arlas-cog-pixel-legend',
  imports: [
    TranslatePipe,
    ShortenNumberPipe
  ],
  templateUrl: './cog-pixel-legend.component.html',
  styleUrl: './cog-pixel-legend.component.scss'
})
export class CogPixelLegendComponent {
  public cogId = input.required<string>();
  public position = input.required<{lng: number; lat: number;}>();

  protected cogValues = signal(new Array<HoveredCogValue>());

  private readonly http = inject(HttpClient);
  private readonly cogService = inject(CogService);

  public constructor() {
    effect(() => {
      const cog = this.cogService.visualisedCogs.get(this.cogId());

      if (cog?.protocol === 'titiler' && cog.visualisationUrl.includes(tilePattern)) {
        // Replace tile pattern with pixel value pattern
        const pixelUrl = cog.visualisationUrl
          .replace(tilePattern, `point/${this.position().lng},${this.position().lat}`);

        this.http.get(pixelUrl, { headers: { [PROTECTED_REQUEST_HEADER]: 'true' }})
          .subscribe(r => {
            const bands = r as {band_names: string[]; values: number[];};
            const values = new Array<HoveredCogValue>();
            for (let i = 0; i < bands.band_names.length; i++) {
              values.push({ band: bands.band_names[i], value: bands.values[i] });
            }

            this.cogValues.set(values);
          });
      }
    });
  }
}
