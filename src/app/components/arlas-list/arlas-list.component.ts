import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { ContributorService } from 'app/services/contributors.service';
import { MapService } from 'app/services/map.service';
import { ResultlistService } from 'app/services/resultlist.service';
import { ModeEnum } from 'arlas-web-components';
import { ResultListContributor } from 'arlas-web-contributors';
import { Column, PageQuery } from 'arlas-web-components';
import { CrossResultlistService } from 'app/services/cross-tabs-communication/cross.resultlist.service';
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


  public constructor(
    public resultlistService: ResultlistService,
    private mapService: MapService,
    private crossResultlistService: CrossResultlistService) { }
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

  public sortColumn(listContributor: ResultListContributor, column: Column) {
    console.log(column);
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'sortColumnEvent', data: column });
    this.crossResultlistService.propagateSortingColumn(listContributor.identifier, column);
  }

  public geoSort(listContributor: ResultListContributor, enabled: boolean) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'sortColumnEvent', data: enabled });
    this.crossResultlistService.propagateGeoSort(listContributor.identifier, enabled);
  }


}
