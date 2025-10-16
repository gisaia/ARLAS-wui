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
import { TranslateModule } from '@ngx-translate/core';
import { PROTECTED_IMAGE_HEADER, ShortenNumberModule } from 'arlas-web-components';
import { CogService } from '../../../services/cog.service';

interface HoveredCogValue {
  band: string;
  value: number;
}

/**
 * Displays the values of the pixel of a hovered COG
 */
@Component({
  selector: 'arlas-cog-pixel-legend',
  standalone: true,
  imports: [
    TranslateModule,
    ShortenNumberModule
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
      // TODO: Use pixelUrl instead
      const pointInfoUrl = this.cogService.visualisedCogs.get(this.cogId()).visualisationUrl
        .replace('tiles/WebMercatorQuad/{z}/{x}/{y}.png', `point/${this.position().lng},${this.position().lat}`);
      this.http.get(pointInfoUrl, { headers: { [PROTECTED_IMAGE_HEADER]: 'true' }})
        .subscribe((r: {band_names: string[]; values: number[];}) => {
          const values = new Array<HoveredCogValue>();
          for (let i = 0; i < r.band_names.length; i++) {
            values.push({ band: r.band_names[i], value: r.values[i] });
          }

          this.cogValues.set(values);
        });
    });
  }
}
