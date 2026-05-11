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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

/**
 * Displays a progress bar while at least one data request is being processed
 */
@Component({
  selector: 'arlas-loading-bar',
  imports: [
    MatProgressBarModule
  ],
  templateUrl: './loading-bar.component.html',
  styleUrl: './loading-bar.component.scss',
})
export class LoadingBarComponent {
  private readonly collaborativeService = inject(ArlasCollaborativesearchService);

  protected readonly isLoading = signal(false);

  public constructor() {
    this.collaborativeService.ongoingSubscribe
      .pipe(takeUntilDestroyed())
      .subscribe(c => {
        this.isLoading.set(this.collaborativeService.totalSubscribe > 0);
      });
  }
}
