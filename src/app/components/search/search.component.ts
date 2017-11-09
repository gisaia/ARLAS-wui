import { Component, Output, Input } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { AggregationResponse, Aggregation, Filter } from 'arlas-api';
import { ArlasWuiCollaborativesearchService } from '../../services/arlaswui.startup.service';
import { ContributorService } from '../../services/contributors.service';
import { projType } from 'arlas-web-core';
import { Response } from '@angular/http';


@Component({
  selector: 'arlas-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  public sizeOnBackspaceBus: Subject<boolean> = new Subject<boolean>();
  public searchedWords = new Array<{ display: string, value: string }>();

  @Output() public wordAddedEvent: Subject<string> = new Subject<string>();
  @Output() public wordRemovedEvent: Subject<string> = new Subject<string>();

  public listItems = new Array<any>();

  constructor(private collaborativeSearchService: ArlasWuiCollaborativesearchService,
    private contributorService: ContributorService) {
    this.subscribeToSearchedWordsInBookMarks();
  }

  public onWordAdded(word: { display: string, value: string }) {
    this.wordAddedEvent.next(word.value);
  }

  public onWordRemoved(word: { display: string, value: string }) {
    this.wordRemovedEvent.next(word.value);
  }


  private subscribeToSearchedWordsInBookMarks() {
    this.collaborativeSearchService.contribFilterBus
      .filter(contributor => contributor.identifier === this.contributorService.CHIPSSEARCH_ID).first().subscribe(contributor => {
        const storedSearchWords = contributor.getFilterDisplayName();
        if (storedSearchWords !== undefined) {
          const searchedWordsSplited = storedSearchWords.split(' ');
          searchedWordsSplited.forEach(word => {
            if (word !== '') {
              this.searchedWords.push({ display: word, value: word });
            }
          });
        }
      });
  }

  public filterSearch(search: string): void {
    const aggregation: Aggregation = {
      type: Aggregation.TypeEnum.Term,
      field: 'callsign',
      include: search.toUpperCase() + '.*',
      size: '10'
    };
    const filter: Filter = {
      q: 'callsign' + ':' + search.toUpperCase() + '*'
    };
    this.collaborativeSearchService.resolveButNotAggregation([projType.aggregate, [aggregation]], null, filter).subscribe(
      results => {
        this.listItems = new Array<any>();
        if (results.elements != null) {
          results.elements.forEach(elem => {
            this.listItems.push(elem.key);
          });
        }
      }
    );
  }

}
