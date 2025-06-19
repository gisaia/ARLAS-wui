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

import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MarkerModule } from '@colsen1991/ngx-translate-extract-marker/extras';
import { TranslateModule } from '@ngx-translate/core';
import { Feature, Geometry } from '@turf/helpers';
import { FormatNumberModule } from 'arlas-web-components';
import { AiasResultComponent, ProcessOutput, ProcessStatus } from 'arlas-wui-toolkit';
import { AoiDimensionsPipe } from '../../pipes/aoi-dimensions.pipe';
import { OrderFormService } from '../../services/order-form.service';
import { RoundKilometer, SquareKilometer } from '../arlas-map/aoi-dimensions/aoi-dimensions.pipes';
import { getObject } from 'arlas-web-core/utils/utils';
import { finalize } from 'rxjs';

export interface OrderFormDialogData {
  aoi: Array<Feature<Geometry>>;
}

export interface OrderFormPayload {
  aoi: Array<Feature<Geometry>>;
  comment: string;
}


@Component({
  selector: 'arlas-order-form',
  standalone: true,
  imports: [
    TranslateModule,
    MatButtonModule,
    MarkerModule,
    AiasResultComponent,
    AoiDimensionsPipe,
    SquareKilometer,
    RoundKilometer,
    FormatNumberModule,
    MatDialogModule
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss'
})
export class OrderFormComponent {
  protected orderFormService = inject(OrderFormService);
  protected data = inject<OrderFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrderFormComponent>);

  protected comment = '';
  protected statusResult: Partial<ProcessOutput> = {
    processID: 'order' as any
  };

  protected orderSubmitted = signal<boolean>(false);
  protected isProcessing = signal<boolean>(false);
  protected hasError = signal<boolean>(false);

  public submit() {
    this.orderSubmitted.set(true);
    this.isProcessing.set(true);
    this.hasError.set(false);
    this.statusResult.started = Date.now();
    this.statusResult.status = ProcessStatus.running;

    this.orderFormService.submit$({ aoi: this.data.aoi, comment: this.comment })
      .pipe(finalize(() => {
        this.isProcessing.set(false);
        this.statusResult.finished = Date.now();
      }))
      .subscribe({
        next: (value) => {
          this.statusResult.status = ProcessStatus.successful;
          this.statusResult.message = this.getMessage(value, this.orderFormService.config.response.ok);
        },
        error: (err) => {
          console.error(err);
          this.hasError.set(true);
          this.statusResult.status = ProcessStatus.failed;
          this.statusResult.message = this.getMessage(err, this.orderFormService.config.response.error);
        }
      });
  }

  public cancel() {
    this.dialogRef.close();
  }

  private getMessage(conf: Object, key: string) {
    if (key.includes('.')) {
      return getObject(conf, 'conf.' + key);
    }
    return conf[key];
  }
}
