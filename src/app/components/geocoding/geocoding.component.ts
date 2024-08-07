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

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import { GeocodingQueryParams, GeocodingResult, GeocodingService } from '@services/geocoding.service';

@Component({
  selector: 'arlas-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements AfterViewInit {
  /**
   * @Output : Angular
   * Emits an event when the geocoding popup needs to be closed
   */
  @Output() private close = new EventEmitter<boolean>();
  /**
   * @Output : Angular
   * Emits an event when the map needs to zoom on the given location
   */
  @Output() private zoomToAddress = new EventEmitter<GeocodingResult>();
  @ViewChild('searchInput') private searchInput: ElementRef;

  protected displayedColumns: string[] = ['address'];
  protected displayTable = false;
  protected hasSearched = false;
  protected hasError = false;
  protected loading = false;
  protected geocodingResult: MatTableDataSource<any>;
  protected searchFormControl = new FormControl('');

  private previousSearch: string;

  public constructor(
    private geocodingService: GeocodingService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  public ngAfterViewInit(): void {
    this.searchInput.nativeElement.focus();
    this.cdr.detectChanges();
  }

  public closePopup(): void {
    this.close.next(true);
  }

  public onSearchLocation($event: GeocodingResult): void {
    this.zoomToAddress.next($event);
  }

  protected search(): void {
    if (!this.searchFormControl.value || this.searchFormControl.value.length === 0) {
      return;
    }

    if (!!this.previousSearch && (this.previousSearch.trim() === this.searchFormControl.value.trim())) {
      return;
    }

    this.displayTable = true;
    this.loading = true;
    this.previousSearch = this.searchFormControl.value;
    const geocodingSearch: GeocodingQueryParams = {
      q: this.searchFormControl.value,
      'accept-language': this.translateService.currentLang
    };
    this.geocodingService.findLocations(geocodingSearch).subscribe({
      next: r => {
        this.hasSearched = true;
        this.loading = false;
        this.displayTable = r && r.length > 0;
        this.geocodingResult = new MatTableDataSource(r);
      },
      error: () => {
        this.hasError = true;
        this.displayTable = false;
        this.loading = false;
      }
    });
  }
}
