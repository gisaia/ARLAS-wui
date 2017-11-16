import { Component, Output, Input } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { AggregationResponse, Aggregation, Filter } from 'arlas-api';
import { ArlasWuiCollaborativesearchService, ArlasWuiConfigService } from '../../services/arlaswui.startup.service';
import { ContributorService } from '../../services/contributors.service';
import { projType } from 'arlas-web-core';
import { Response } from '@angular/http';
import { FormControl } from '@angular/forms';
import { CollaborativesearchService } from 'arlas-web-core/services/collaborativesearch.service';
import { ConfigService } from 'arlas-web-core/services/config.service';
import { ChipsSearchContributor } from 'arlas-web-contributors';

@Component({
  selector: 'arlas-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
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

  constructor(private collaborativeService: ArlasWuiCollaborativesearchService,
    private contributorService: ContributorService,
    private configService: ArlasWuiConfigService) {
    this.autocomplete_field = configService.getValue('catalog.web.app.components.autocomplete_field');
    this.autocomplete_size = configService.getValue('catalog.web.app.components.autocomplete_size');
    this.searchContributorId = this.contributorService.getChipSearchContributor(this.onLastBackSpace).identifier;
    this.searchCtrl = new FormControl();
    this.keyEvent.pairwise().subscribe(l => {
      if (l[1] === 0 && l[0] === 1) {
        this.collaborativeService.removeFilter(this.searchContributorId);
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
      q: search + '*'
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
