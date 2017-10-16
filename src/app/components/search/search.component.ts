import { Component, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'arlas-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  public sizeOnBackspaceBus: Subject<number> = new Subject<number>();
  @Output() public valuesChangedEvent: Subject<any> = new Subject<any>();

  public searchWord(form: any) {
    this.valuesChangedEvent.next(form.value.search);
    form.reset();
  }

  public onBackspace(event: KeyboardEvent, searchValue: string) {
    if (event.keyCode === 8) {
      this.sizeOnBackspaceBus.next(searchValue.length);
    }
  }
}
