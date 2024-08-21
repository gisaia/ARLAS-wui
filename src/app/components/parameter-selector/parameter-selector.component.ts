import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'arlas-parameter-selector',
  templateUrl: './parameter-selector.component.html',
  styleUrls: ['./parameter-selector.component.scss']
})
export class ParameterSelectorComponent implements OnInit, OnChanges {

  @Input() public datacubePath = 'gs://gisaia-datacube/demo_datacube/';
  public band = 'B05';
  @Output() public bandEvent = new EventEmitter<string>();
  public timeIndex = 0;
  @Output() public timeIndexEvent = new EventEmitter<number>();

  protected timeOptions: Array<number>;
  protected bandOptions: Array<string>;

  protected loading = false;

  // eslint-disable-next-line max-len
  private FUSED_ENDPOINT = 'https://www.fused.io/server/v1/realtime-shared/fsh_1nyFywuzGtIyhOfFAwayRT/run/file?dtype_out_raster=png&dtype_out_vector=csv';

  public constructor(private http: HttpClient) { }

  public ngOnInit(): void {
    this.getDatacubeCaracteristics();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['datacubePath']) {
      this.getDatacubeCaracteristics();
    }
  }

  public onBandChange(band: string) {
    this.band = band;
    this.bandEvent.next(band);
  }

  public onTimeIndexChange(timeIndex: number) {
    this.timeIndex = timeIndex;
    this.timeIndexEvent.next(timeIndex);
  }

  private getDatacubeCaracteristics() {
    this.loading = true;
    this.http.get(this.FUSED_ENDPOINT + '&path=' + this.datacubePath)
      .pipe(catchError((e: HttpErrorResponse, c) => {
        if (e.status === 200) {
          const rows = (e.error.text as string).split('\n').slice(1);
          this.timeOptions = rows.map(r => +r.split(',')[1] * 1000).filter(t => !!t);
          this.onTimeIndexChange(0);
          this.bandOptions = rows.map(r => r.split(',')[2]).filter(v => !!v);
          this.onBandChange(this.bandOptions[0]);
        }
        this.loading = false;
        return of();
      }))
      .subscribe();
  }
}
