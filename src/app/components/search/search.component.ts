import { Component, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ArlasWuiCollaborativesearchService } from '../../services/arlaswui.startup.service';
import { ContributorService } from '../../services/contributors.service';


@Component({
  selector: 'arlas-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  public sizeOnBackspaceBus: Subject<boolean> = new Subject<boolean>();
  public searchedWords = new Array<{display: string, value: string}>();
  public searchedWordsSet = new Set<{display: string, value: string}>();

  @Output() public wordAddedEvent: Subject<string> = new Subject<string>();
  @Output() public wordRemovedEvent: Subject<string> = new Subject<string>();


  constructor(private collaborativesearchService: ArlasWuiCollaborativesearchService,
    private contributorService: ContributorService) {
      this.subscribeToSearchedWordsInBookMarks();
  }

  public onWordAdded(word: {display: string, value: string}) {
    this.wordAddedEvent.next(word.value);
  }

  public onWordRemoved(word: {display: string, value: string}) {
    this.wordRemovedEvent.next(word.value);
  }


  private subscribeToSearchedWordsInBookMarks() {
    this.collaborativesearchService.contribFilterBus
      .filter(contributor => contributor.identifier === this.contributorService.CHIPSSEARCH_ID ).first().subscribe(contributor => {
        const searchedWords = contributor.getFilterDisplayName();
        if (searchedWords !== undefined) {
          const searchedWordsSplited = Array.from(searchedWords.split(' '));
          this.searchedWordsSet = new Set<{display: string, value: string}>();
          searchedWordsSplited.forEach(word => {
            if (word !== '') {
              this.searchedWordsSet.add({display: word, value: word});
            }
          });
          this.searchedWords = Array.from(this.searchedWordsSet);
        }
      });
  }
}
