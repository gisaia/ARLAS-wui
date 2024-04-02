/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
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
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { GeocodingQueryParams, GeocodingResult, GeocodingService } from '../../../services/geocoding.service';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'arlas-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit, AfterViewInit {
  @Output() private close = new EventEmitter();
  @Output() private zoomToAddress = new EventEmitter();
  protected displayedColumns: string[] = ['address'];
  protected displayTable = false;
  protected hasSearched = false;
  protected loading = false;
  @ViewChild('searchInput') private searchInput: ElementRef;
  protected geocodingResult: MatTableDataSource<any>;
  protected searchFormControl = new FormControl('');
  private previousSearch: string;

  public constructor(private geocodingService: GeocodingService, private translateService: TranslateService, private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
  }

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
    if(!this.searchFormControl.value || this.searchFormControl.value.length === 0) {
      console.warn('no value', this.searchFormControl.value);
      return;
    }

    if(!!this.previousSearch && (this.previousSearch.trim()  === this.searchFormControl.value.trim())) {
      return;
    }

    this.displayTable = true;
    this.loading = true;
    this.previousSearch = this.searchFormControl.value;
    const geocodingSearch: GeocodingQueryParams = {
      q: this.searchFormControl.value,
      'accept-language': this.translateService.currentLang
    };
    this.geocodingService.findLocations(geocodingSearch).subscribe(r => {
      this.hasSearched = true;
      this.loading= false;
      this.displayTable = r && r.length > 0;
      this.geocodingResult = new MatTableDataSource(r);
    });
  }
}
