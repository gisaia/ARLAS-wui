import { Injectable } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { BroadcastPayload, SharedWorkerBusService } from 'windows-communication-bus';
import { ResultlistService } from '../resultlist.service';
import { Column, Action, ElementIdentifier } from 'arlas-web-components';
import { CrossSort } from './tools/tools';



export interface CrossGeoSort {
  listContributorId: string;
  enabled: boolean;
}

export interface CrossAction {
  listContributorId: string;
  action: { action: Action; elementidentifier: ElementIdentifier; };
}

@Injectable()
export class CrossResultlistService {
  private subscription = new Subscription();
  private HIGHLIGHT_ITEMS_MESSAGE = 'highlight-items';
  public SORT_COLUMN_MESSAGE = 'sort-columns';
  private GEO_SORT_MESSAGE = 'geo-sort';
  private ACTION_MESSAGE = 'action';
  public constructor(private sharedWorkerBusService: SharedWorkerBusService, private resultlistService: ResultlistService) {
    this.listenToExternalItemsHighlight$();
    this.listenToExternalSortColumn$();
    this.listenToExternalGeoSort$();
    this.listenToExternalAction$();
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
      this.sharedWorkerBusService.payloadOfName(this.HIGHLIGHT_ITEMS_MESSAGE).pipe(debounceTime(100)).subscribe((m: BroadcastPayload) => {
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

  // ############# ACTION ###########################
  public propagateAction(listContributorId: string, action: { action: Action; elementidentifier: ElementIdentifier; }) {
    this.sharedWorkerBusService.publishMessage({
      name: this.ACTION_MESSAGE,
      data: {
        listContributorId,
        action
      }
    });
  }

  public listenToExternalAction$() {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.ACTION_MESSAGE).subscribe((m: BroadcastPayload) => {
        const crossAction = (m.data as CrossAction);
        this.resultlistService.getBoardEvents({ origin: crossAction.listContributorId, event: 'actionOnItemEvent', data: crossAction.action });
      })
    );
  }
  public terminate() {
    this.subscription.unsubscribe();
  }
}
