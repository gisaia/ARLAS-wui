import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'arlas-parameter-selector',
  templateUrl: './parameter-selector.component.html',
  styleUrls: ['./parameter-selector.component.scss']
})
export class ParameterSelectorComponent implements OnInit {

  public band = 'B05';
  @Output() public bandEvent = new EventEmitter<string>();
  public timeIndex = 0;
  @Output() public timeIndexEvent = new EventEmitter<number>();

  protected timeOptions = [1662336000000, 1662768000000, 1663632000000, 1664064000000, 1664928000000];

  public constructor() { }

  public ngOnInit(): void {
  }

  public onBandChange(band: string) {
    this.band = band;
    this.bandEvent.next(band);
  }

  public onTimeIndexChange(timeIndex: number) {
    this.timeIndex = timeIndex;
    this.timeIndexEvent.next(timeIndex);
  }

}
