import { Injectable } from '@angular/core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { Subscription } from 'rxjs';
import { BroadcastPayload, SharedWorkerBusService } from 'windows-communication-bus';
import { fromEntries } from 'arlas-web-core';

@Injectable()
export class CrossCollaborationsService {
  private subscription = new Subscription();
  private COLLABORATE_MESSAGE = 'collaborations';
  public constructor(
    private collaborativeService: ArlasCollaborativesearchService,
    private sharedWorkerBusService: SharedWorkerBusService) {

    this.propagateCollaborations$();
    this.listenToExternalCollaborations$();
  }

  // emit collaborations to other tabs when the collaborationBus of this tab is triggered.
  public propagateCollaborations$() {
    this.subscription.add(
      this.collaborativeService.collaborationBus.subscribe((c) => {
        if (c.id !== 'url') {
          this.sharedWorkerBusService.publishMessage({
            name: this.COLLABORATE_MESSAGE,
            data: fromEntries(this.collaborativeService.collaborations)
          });
        }
      })
    );
  }

  public listenToExternalCollaborations$() {
    this.subscription.add(
      this.sharedWorkerBusService.payloadOfName(this.COLLABORATE_MESSAGE).subscribe((m: BroadcastPayload) => {
        this.collaborativeService.setCollaborations(m.data);
      })
    );
  }

  public terminate() {
    this.subscription.unsubscribe();
  }
}
