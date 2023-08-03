import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { BroadcastPayload, SharedWorkerBusService } from 'windows-communication-bus';
import { ResultlistService } from '../resultlist.service';

@Injectable()
export class CrossResultlistService {
  private subscription = new Subscription();
  private HIGHLIGHT_ITEMS_MESSAGE = 'highlight-items';
  public constructor(private sharedWorkerBusService: SharedWorkerBusService, private resultlistService: ResultlistService) {
    this.listenToExternalItemsHighlight$();
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

  public terminate() {
    this.subscription.unsubscribe();
  }
}
