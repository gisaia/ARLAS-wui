import { Component, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';

import { MapContributor } from 'arlas-web-contributors';
import { MapglComponent } from 'arlas-web-components';

import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from './services/arlaswui.startup.service';
import { Subject } from 'rxjs/Rx';


@Component({
  selector: 'arlas-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public mapglcontributor: MapContributor;
  public initCenter = [0, 0];


  @ViewChild(MapglComponent) private mapglComponent: MapglComponent;

  constructor(private http: Http,
    private configService: ArlasWuiConfigService,
    public collaborativeService: ArlasWuiCollaborativesearchService
  ) { }
  public ngOnInit() {

    this.mapglcontributor = new MapContributor('mapbox',
      this.mapglComponent.onRemoveBbox,
      this.mapglComponent.drawType,
      this.collaborativeService,
      this.configService
    );
  }
}
