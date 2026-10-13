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
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { ArlasConfigService, ArlasIamService, ArlasSettingsService, AuthentificationService } from 'arlas-wui-toolkit';
import { throwError } from 'rxjs';
import { OrderFormComponent, OrderFormPayload } from '../components/order-form/order-form.component';
import { updateAuthorizationHeaders$ } from '../tools/authorization';


export interface OrderFormConfig {
  /** Whether the order form is enabled */
  enabled: boolean;
  text: {
    /** Text of the button to trigger the order */
    button?: string;
    /** Title of the form */
    form?: string;
  };
  /** URL of the endpoint where the POST for the order will be sent */
  endpoint: string;
  /**
   * Structure of the payload to send. Can contain pre-defined values.
   * If one of the value is "$AOI" or "$COMMENT" they will be replaced with the order's aoi and user defined comments respectively
   */
  payload: { [key: string]: any; };
  response: {
    /** Message to display when the order is a success */
    ok: string;
    /** Message to display when the order failed */
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

  public config?: OrderFormConfig;
  private headers: { [name: string]: string; } = {};

  public constructor() {
    this.config = this.configService.getValue('arlas.web.externalNode.order_form');
    if (this.config?.enabled) {
      // Check that everything needed is present
      this.config.enabled = !!this.config.endpoint && !!this.config.payload && !!this.config.response
        && !!this.config.response.ok && !!this.config.response.error;
      this.config.text = {
        button: marker('Order'),
        form: marker('Order a product'),
        ...this.config.text
      };
    }
    this.setHeaders();
  }

  public openForm$(aoi: Array<GeoJSON.Feature<GeoJSON.Geometry>>) {
    return this.dialog.open(OrderFormComponent, {
      data: {
        aoi: aoi
      }
    }).afterClosed();
  }

  public submit$(formPayload: OrderFormPayload) {
    if (!this.config) {
      return throwError(() => new Error('[ARLAS][ORDER] No configuration was set'));
    }

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
