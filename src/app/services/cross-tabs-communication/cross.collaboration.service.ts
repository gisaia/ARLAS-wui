import { Injectable } from '@angular/core';
import { fromEntries } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { Subject, takeUntil } from 'rxjs';
import { BroadcastPayload, SharedWorkerBusService } from 'windows-communication-bus';

@Injectable()
export class CrossCollaborationsService {
  private _onTerminate$ = new Subject<boolean>();
  private COLLABORATE_MESSAGE = 'collaborations';

  public constructor(
    private collaborativeService: ArlasCollaborativesearchService,
    private sharedWorkerBusService: SharedWorkerBusService
  ) {
    this.propagateCollaborations$();
    this.listenToExternalCollaborations$();
  }

  /** Emit collaborations to other tabs when the collaborationBus of this tab is triggered.
   */
  public propagateCollaborations$() {
    this.collaborativeService.collaborationBus
      .pipe(takeUntil(this._onTerminate$))
      .subscribe((c) => {
        if (c.id !== 'url') {
          this.sharedWorkerBusService.publishMessage({
            name: this.COLLABORATE_MESSAGE,
            data: fromEntries(this.collaborativeService.collaborations)
          });
        }
      });
  }

  public listenToExternalCollaborations$() {
    this.sharedWorkerBusService.payloadOfName(this.COLLABORATE_MESSAGE)
      .pipe(takeUntil(this._onTerminate$))
      .subscribe((m: BroadcastPayload) => {
        this.collaborativeService.setCollaborations(m.data);
      });
  }

  public terminate() {
    this._onTerminate$.next(true);
    this._onTerminate$.complete();
  }
}
