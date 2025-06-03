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
import { DestroyRef, inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as helpers from '@turf/helpers';
import { updateAuthorizationHeaders$ } from 'app/tools/authorization';
import { ArlasConfigService, ArlasIamService, ArlasSettingsService, AuthentificationService } from 'arlas-wui-toolkit';
import { OrderFormComponent, OrderFormPayload } from '../components/order-form/order-form.component';


export interface OrderFormConfig {
  enabled: boolean;
  text: {
    button: string;
    form: string;
  };
  endpoint: string;
  payload: { [key: string]: any; };
  response: {
    ok: string;
    error: string;
  };
};

@Injectable({
  providedIn: 'root'
})
export class OrderFormService {
  private readonly configService = inject(ArlasConfigService);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);
  private readonly settingsService = inject(ArlasSettingsService);
  private readonly arlasIamService = inject(ArlasIamService);
  private readonly authentService = inject(AuthentificationService);
  private readonly destroyRef = inject(DestroyRef);

  public config: OrderFormConfig;
  private headers: { [name: string]: string; };

  public constructor() {
    this.config = this.configService.getValue('arlas.web.externalNode.order_form');
    this.setHeaders();
  }

  public openForm$(aoi: Array<helpers.Feature<helpers.Geometry>>) {
    return this.dialog.open(OrderFormComponent, {
      data: {
        aoi: aoi
      }
    }).afterClosed();
  }

  public submit$(formPayload: OrderFormPayload) {
    const payload = JSON.stringify(this.config.payload)
      .replace('"$AOI"', JSON.stringify(formPayload.aoi))
      .replace('$COMMENT', formPayload.comment);

    return this.http.post(this.config.endpoint, JSON.parse(payload), { headers: this.headers });
  }

  private setHeaders() {
    // Set headers only if the endpoint matches the current hostname
    if (this.config?.endpoint && (new URL(this.config?.endpoint)).hostname === window.location.hostname) {
      updateAuthorizationHeaders$(this.settingsService.getAuthentSettings(), this.arlasIamService, this.authentService, this.destroyRef)
        .subscribe(h => {
          this.headers = h ?? {};
        });
    }
  }
}
