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

import { Component, Output, Input, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { AggregationResponse, Aggregation, Filter } from 'arlas-api';
import { ContributorService } from '../../services/contributors.service';
import { projType } from 'arlas-web-core';
import { Response } from '@angular/http';
import { FormControl } from '@angular/forms';
import { ChipsSearchContributor } from 'arlas-web-contributors';
import { MatIcon } from '@angular/material';
import { ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit/services/startup/startup.service';

@Component({
  selector: 'arlas-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  public onLastBackSpace: Subject<boolean> = new Subject<boolean>();
  public searchCtrl: FormControl;
  public filteredSearch: Observable<any[]>;
  private autocomplete_field: string;
  private autocomplete_size: string;
  private keyEvent: Subject<number> = new Subject<number>();
  private searchContributorId: string;
  @Input() public searches: Observable<AggregationResponse>;
  @Output() public valuesChangedEvent: Subject<string> = new Subject<string>();

  constructor( private collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    private configService: ArlasConfigService,
    private cdr: ChangeDetectorRef
  ) {

    this.autocomplete_field = configService.getValue('arlas-wui.web.app.components.chipssearch.autocomplete_field');
    this.autocomplete_size = configService.getValue('arlas-wui.web.app.components.chipssearch.autocomplete_size');
    this.searchContributorId = this.contributorService.getChipSearchContributor(this.onLastBackSpace).identifier;
    this.searchCtrl = new FormControl();
    this.keyEvent.pairwise().subscribe(l => {
      if (l[1] === 0 && l[0] !== 0) {
        this.collaborativeService.removeFilter(this.searchContributorId);
        this.cdr.detectChanges();
      }
    });

    this.collaborativeService.contribFilterBus
      .filter(contributor => contributor.identifier === 'chipssearch')
      .filter(contributor => (<ChipsSearchContributor>contributor).chipMapData.size !== 0).first().subscribe(
        contributor => {
          let initSearchValue = '';
          (<ChipsSearchContributor>contributor).chipMapData.forEach( (v, k) => initSearchValue += k + ' ');
          this.searchCtrl.setValue( initSearchValue);
        }
      );

    const autocomplete = this.searchCtrl.valueChanges.debounceTime(250)
      .startWith('')
      .filter(search => search !== null)
      .filter(search => search.length > 1)
      .flatMap(search => this.filterSearch(search))
      .map(f => f.elements);

    const noautocomplete = this.searchCtrl.valueChanges.debounceTime(250)
      .startWith('')
      .filter(search => search !== null)
      .filter(search => search.length < 2)
      .map(f => []);

    const nullautocomplete = this.searchCtrl.valueChanges.debounceTime(250)
      .startWith('')
      .filter(search => search == null)
      .map(f => []);

    this.filteredSearch = noautocomplete.merge(autocomplete).merge(nullautocomplete);
  }

  public filterSearch(search: string): Observable<AggregationResponse> {
    const aggregation: Aggregation = {
      type: Aggregation.TypeEnum.Term,
      field: this.autocomplete_field,
      include: search + '.*',
      size: this.autocomplete_size
    };
    const filter: Filter = {
      q: [[search + '*']]
    };
    this.searches = this.collaborativeService.resolveButNotAggregation(
      [projType.aggregate, [aggregation]],
      this.searchContributorId,
      filter
    );
    return this.searches;
  }

  public onKeyUp(event: KeyboardEvent) {
    if (this.searchCtrl.value !== null) {
      this.keyEvent.next(this.searchCtrl.value.length);
    }
    if (event.keyCode === 13) {
      this.valuesChangedEvent.next(this.searchCtrl.value);
    }
  }

  public clickItemSearch() {
    this.valuesChangedEvent.next(this.searchCtrl.value);
  }
}
