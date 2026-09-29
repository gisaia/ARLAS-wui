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

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MarkerModule } from '@colsen1991/ngx-translate-extract-marker/extras';
import { TranslatePipe } from '@ngx-translate/core';
import { FormatNumberPipe } from 'arlas-web-components';
import { getObject } from 'arlas-web-core/utils/utils';
import { AiasResultComponent, ProcessOutput, ProcessStatus } from 'arlas-wui-toolkit';
import { Feature, Polygon } from 'geojson';
import { finalize } from 'rxjs';
import { AoiDimensionsPipe } from '../../pipes/aoi-dimensions.pipe';
import { OpentelemetryService } from '../../services/opentelemetry.service';
import { OrderFormService } from '../../services/order-form.service';
import { RoundKilometer, SquareKilometer } from '../arlas-map/aoi-dimensions/aoi-dimensions.pipes';

export interface OrderFormDialogData {
  aoi: Array<Feature<Polygon>>;
}

export interface OrderFormPayload {
  aoi: Array<Feature<Polygon>>;
  comment: string;
}


@Component({
  selector: 'arlas-order-form',
  imports: [
    TranslatePipe,
    MatButtonModule,
    MarkerModule,
    AiasResultComponent,
    AoiDimensionsPipe,
    SquareKilometer,
    RoundKilometer,
    FormatNumberPipe,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss'
})
export class OrderFormComponent implements OnInit {
  protected orderFormService = inject(OrderFormService);
  protected data = inject<OrderFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrderFormComponent>);
  private readonly opentelemetryService = inject(OpentelemetryService);

  protected comment = '';
  protected statusResult = {
    processID: 'download'
  } as ProcessOutput;

  protected orderSubmitted = signal<boolean>(false);
  protected isProcessing = signal<boolean>(false);
  protected hasError = signal<boolean>(false);

  private formStartTimestamp = Date.now();

  public ngOnInit(): void {
    this.opentelemetryService.sendCustomMessage('form_started', {
      form_id: 'order_form',
      process_id: this.statusResult.processID,
      aoi_count: this.data?.aoi?.length ?? 0
    });
  }

  public submit() {
    this.orderSubmitted.set(true);
    this.isProcessing.set(true);
    this.hasError.set(false);
    this.statusResult.started = Date.now();
    this.statusResult.status = ProcessStatus.running;

    this.opentelemetryService.sendCustomMessage('cta_click', {
      cta_id: 'order_submit_button',
      form_id: 'order_form',
      process_id: this.statusResult.processID
    });

    this.orderFormService.submit$({ aoi: this.data.aoi, comment: this.comment })
      .pipe(finalize(() => {
        this.isProcessing.set(false);
        this.statusResult.finished = Date.now();
      }))
      .subscribe({
        next: (value) => {
          this.statusResult.status = ProcessStatus.successful;
          this.statusResult.message = this.getMessage(value, this.orderFormService.config.response.ok);
          const durationMs = Date.now() - this.formStartTimestamp;
          this.opentelemetryService.sendCustomMessage('form_completed', {
            form_id: 'order_form',
            process_id: this.statusResult.processID,
            duration_ms: durationMs
          });
          this.opentelemetryService.sendCustomMessage('task_completed', {
            task_name: 'order_submission',
            process_id: this.statusResult.processID,
            duration_ms: durationMs
          });
        },
        error: (err) => {
          console.error(err);
          this.hasError.set(true);
          this.statusResult.status = ProcessStatus.failed;
          this.statusResult.message = this.getMessage(err, this.orderFormService.config.response.error);
          this.opentelemetryService.sendCustomMessage('user_error_encountered', {
            error_type: 'order_submission_failed',
            process_id: this.statusResult.processID,
            error_message: typeof err === 'string' ? err : err?.message
          });
        }
      });
  }

  public cancel() {
    if (!this.orderSubmitted()) {
      this.opentelemetryService.sendCustomMessage('funnel_abandoned', {
        funnel_name: 'order_process',
        step: 'configuration',
        time_spent_ms: Date.now() - this.formStartTimestamp,
        has_comment: !!this.comment && this.comment.trim().length > 0
      });
    }
    this.dialogRef.close();
  }

  private getMessage(conf: Object, key: string) {
    if (key.includes('.')) {
      return getObject(conf, 'conf.' + key);
    }
    return conf[key];
  }
}
