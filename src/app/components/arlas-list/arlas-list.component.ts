import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { ContributorService } from 'app/services/contributors.service';
import { MapService } from 'app/services/map.service';
import { ResultlistService } from 'app/services/resultlist.service';
import { ModeEnum } from 'arlas-web-components';
@Component({
  selector: 'arlas-list',
  templateUrl: './arlas-list.component.html',
  styleUrls: ['./arlas-list.component.css']
})
export class ArlasListComponent implements OnInit {
  @Input() public selectedListTabIndex = 0;
  @Input() public listOpen = true;
  @Input() public nbGridColumns = 5;
  @Input() public tableWidth = 900;


  public constructor(public resultlistService: ResultlistService,
    private mapService: MapService) { }
  @ViewChild('tabsList', { static: false }) public tabsList: MatTabGroup;

  public ngOnInit(): void {
    this.resultlistService.resultlistContributors.forEach(c => {
      const mapcontributor = this.mapService.mapContributors.find(mc => mc.collection === c.collection);
      if (!!mapcontributor) {
        c.addAction({ id: 'zoomToFeature', label: 'Zoom to', cssClass: '', tooltip: 'Zoom to product' });
      }
      if (!!this.resultlistService.resultListConfigPerContId.get(c.identifier)) {
        if (!!this.resultlistService.resultListConfigPerContId.get(c.identifier).visualisationLink) {
          c.addAction({ id: 'visualize', label: 'Visualize', cssClass: '', tooltip: 'Visualize on the map' });
        }
        if (!!this.resultlistService.resultListConfigPerContId.get(c.identifier).downloadLink) {
          c.addAction({ id: 'download', label: 'Download', cssClass: '', tooltip: 'Download' });
        }
      }
    });

  }

  public changeListResultMode(mode: ModeEnum, identifier: string) {
    const config = this.resultlistService.resultListConfigPerContId.get(identifier);
    config.defautMode = mode;
    this.resultlistService.resultListConfigPerContId.set(identifier, config);
    setTimeout(() => {
      this.resultlistService.updateVisibleItems();
    }, 100);
  }


}
