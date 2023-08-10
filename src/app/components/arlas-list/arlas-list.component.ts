import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { MapService } from 'app/services/map.service';
import { ResultlistService } from 'app/services/resultlist.service';
import { ModeEnum } from 'arlas-web-components';
import { ResultListContributor } from 'arlas-web-contributors';
import { Column, Action, ElementIdentifier, Item, PageQuery } from 'arlas-web-components';
import { CrossResultlistService } from 'app/services/cross-tabs-communication/cross.resultlist.service';
import { CrossMapService, CrossMove } from 'app/services/cross-tabs-communication/cross.map.service';
import { isElementInViewport } from 'app/tools/utils';
import { SharedWorkerBusService } from 'windows-communication-bus';
import { filter, map } from 'rxjs';
import { CrossSort } from 'app/services/cross-tabs-communication/tools/tools';
@Component({
  selector: 'arlas-list',
  templateUrl: './arlas-list.component.html',
  styleUrls: ['./arlas-list.component.css']
})
export class ArlasListComponent implements OnInit, AfterViewInit {
  @Input() public selectedListTabIndex = 0;
  @Input() public listOpen = true;
  @Input() public nbGridColumns = 5;
  @Input() public tableWidth = undefined;


  public constructor(
    public resultlistService: ResultlistService,
    private mapService: MapService,
    private crossResultlistService: CrossResultlistService,
    private crossMapService: CrossMapService,
    private sharedWorkerBus: SharedWorkerBusService) { }
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

  public ngAfterViewInit(): void {
    this.sharedWorkerBus.publish({
      type: 'init',
      payload: {
        name: 'list',
        data: this.crossMapService.MOVE_MESSAGE
      }
    });
    this.sharedWorkerBus.messagesOfType('init').
      pipe(
        map(m => m.payload),
        filter(p => (!!p))
      ).subscribe((m) => {
        if (m.name === this.crossMapService.MOVE_MESSAGE) {
          setTimeout(() => {
            const move = m.data as CrossMove;
            this.resultlistService.applyMapExtent(move.pwithinraw, move.pwithin);
            this.sharedWorkerBus.publish({
              type: 'init',
              payload: {
                name: 'list',
                data: this.crossResultlistService.SORT_COLUMN_MESSAGE
              }
            });
          }, 2000);
        } else if (m.name === this.crossResultlistService.SORT_COLUMN_MESSAGE) {
          const crossSort = m.data as CrossSort;
          this.resultlistService.sortColumnEvent(crossSort.listContributorId, crossSort.column);
        }
      }
      );
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
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'sortColumnEvent', data: column });
    this.crossResultlistService.propagateSortingColumn(listContributor.identifier, column);
  }

  public geoSort(listContributor: ResultListContributor, enabled: boolean) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'geoAutoSortEvent', data: enabled });
    this.crossResultlistService.propagateGeoSort(listContributor.identifier, enabled);
  }

  public applyActionOnItem(listContributor: ResultListContributor, action: { action: Action; elementidentifier: ElementIdentifier; }) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'actionOnItemEvent', data: action });
    this.crossResultlistService.propagateAction(listContributor.identifier, action);
  }

  public consultItem(listContributor: ResultListContributor, data: ElementIdentifier) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'consultedItemEvent', data });
    this.crossMapService.propagateFeatureHover(data, listContributor.collection);
  }

  public selectItems(listContributor: ResultListContributor, data: string[]) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'selectedItemsEvent', data });
    const idPath = this.resultlistService.collectionToDescription.get(listContributor.collection).id_path;
    this.crossMapService.propagateFeaturesSelection(idPath, data, listContributor.collection);
  }

  public updateMapStyleFromScroll(items: Item[], collection) {
    this.resultlistService.updateMapStyleFromScroll(items, collection);
    this.crossMapService.propagateScrollMapRestyle(items.map(i => i.identifier), collection);
  }

  public updateMapStyleFromChange(items: Map<string, string>[], collection) {
    this.resultlistService.updateMapStyleFromChange(items, collection);
    const description = this.resultlistService.collectionToDescription.get(collection);
    if (description) {
      const idFieldName = this.resultlistService.collectionToDescription.get(collection).id_path;
      setTimeout(() => {
        const visibleItems = items.map(item => item.get(idFieldName))
          .filter(id => id !== undefined && isElementInViewport(document.getElementById(id.toString())));
        this.crossMapService.propagateScrollMapRestyle(visibleItems, collection);
      }, 0);
    }
  }

  public paginate(listContributor: ResultListContributor, pageQuery: PageQuery) {
    this.resultlistService.getBoardEvents({ origin: listContributor.identifier, event: 'paginationEvent', data: pageQuery });
    this.crossMapService.propagatePaginate(listContributor.identifier, pageQuery);
  }

}
