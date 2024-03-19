import {AfterViewInit, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {GeocodingQueryParams, GeocodingResult, GeocodingService} from "../../../services/geocoding.service";
import {TranslateService} from "@ngx-translate/core";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'arlas-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit, AfterViewInit {
  @Output() close = new EventEmitter();
  @Output() zoomToAdress = new EventEmitter();
  protected geocodingResult: MatTableDataSource<any>;
  protected searchFormControl = new FormControl('');
  displayedColumns: string[] = ['address'];
  displayTable: boolean = false;
  hasDoneFirstSearch = false;
  protected total = 0;

  public constructor(private geocodingService: GeocodingService, private translateService: TranslateService) { }

  public ngOnInit(): void {
  }

  ngAfterViewInit() {

  }

  protected search(){
    const geocodingSearch: GeocodingQueryParams = {
      q: this.searchFormControl.value,
      "accept-language": this.translateService.currentLang
    }
   this.geocodingService.findLocations(geocodingSearch).subscribe( r => {
     this.hasDoneFirstSearch = true;
     this.displayTable = r && r.length > 0;
     this.geocodingResult = new MatTableDataSource(r);
     this.total = r.length;
   });
  }

  closePopup() {
    this.close.next(true)
  }

  onSearchLocation($event: GeocodingResult) {
    this.zoomToAdress.next($event);
  }
}
