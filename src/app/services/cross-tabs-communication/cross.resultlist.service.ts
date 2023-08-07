import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { BroadcastPayload, SharedWorkerBusService } from 'windows-communication-bus';
import { ResultlistService } from '../resultlist.service';
import { Column } from 'arlas-web-components';

export interface CrossSort {
  listContributorId: string;
  column: Column;
}

export interface CrossGeoSort {
  listContributorId: string;
  enabled: boolean;
}

@Injectable()
export class CrossResultlistService {
  private subscription = new Subscription();
  private HIGHLIGHT_ITEMS_MESSAGE = 'highlight-items';
  private SORT_COLUMN_MESSAGE = 'sort-columns';
  private GEO_SORT_MESSAGE = 'geo-sort';
  public constructor(private sharedWorkerBusService: SharedWorkerBusService, private resultlistService: ResultlistService) {
    this.listenToExternalItemsHighlight$();
    this.listenToExternalSortColumn$();
    this.listenToExternalGeoSort$();
  }

  // ############# FEATURE HOVER ###########################
  public propagateItemsHighlight(hoveredFeatures: any[]) {
    this.sharedWorkerBusService.publishMessage({
      name: this.HIGHLIGHT_ITEMS_MESSAGE,
      data: hoveredFeatures
    });
  }

  public listenToExternalItemsHighlight$() {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.HIGHLIGHT_ITEMS_MESSAGE).subscribe((m: BroadcastPayload) => {
        const hoveredFeatures = m.data;
        if (hoveredFeatures) {
          this.resultlistService.highlightItems(hoveredFeatures);
        } else {
          this.resultlistService.clearHighlightedItems();
        }
      })
    );
  }


  // ############# SORT COLUMN ###########################
  public propagateSortingColumn(listContributorId: string, column: Column) {
    this.sharedWorkerBusService.publishMessage({
      name: this.SORT_COLUMN_MESSAGE,
      data: {
        listContributorId,
        column
      }
    });
  }

  public listenToExternalSortColumn$() {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.SORT_COLUMN_MESSAGE).subscribe((m: BroadcastPayload) => {
        const crossSort = (m.data as CrossSort);
        this.resultlistService.sortColumnEvent(crossSort.listContributorId, crossSort.column);
      })
    );
  }

  // ############# GEOSORT ###########################
  public propagateGeoSort(listContributorId: string, enabled: boolean) {
    this.sharedWorkerBusService.publishMessage({
      name: this.GEO_SORT_MESSAGE,
      data: {
        listContributorId,
        enabled
      }
    });
  }

  public listenToExternalGeoSort$() {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.GEO_SORT_MESSAGE).subscribe((m: BroadcastPayload) => {
        const crossGeoSort = (m.data as CrossGeoSort);
        this.resultlistService.onActiveOnGeosort(crossGeoSort.enabled, crossGeoSort.listContributorId);
      })
    );
  }
  public terminate() {
    this.subscription.unsubscribe();
  }
}
