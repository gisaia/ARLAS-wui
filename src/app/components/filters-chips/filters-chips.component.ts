import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ConfigService, projType } from 'arlas-web-core';
import { AppComponent } from '../../app.component';
import { ArlasWuiCollaborativesearchService, ArlasWuiConfigService } from '../../services/arlaswui.startup.service';
import { ContributorService } from '../../services/contributors.service';
import { Hits } from 'arlas-api';
import { Contributor } from 'arlas-web-core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';

@Component({
  selector: 'arlas-filters-chips',
  templateUrl: './filters-chips.component.html',
  styleUrls: ['./filters-chips.component.css']
})
export class FiltersChipsComponent {

  public collaborations: Set<string> = new Set<string>();
  public contributors: Map<string, Contributor> = new Map<string, Contributor>();
  public contibutorsIcons: Map<string, string>;

  constructor (private collaborativesearchService: ArlasWuiCollaborativesearchService, private configService: ArlasWuiConfigService
   , private contributorService: ContributorService ) {

    this.contributors = this.collaborativesearchService.registry;
    this.subscribeToFutureCollaborations();
    this.contibutorsIcons = this.contributorService.getAllContributorsIcons();
  }

  public removeCollaboration(contributorId: string): void {
    this.collaborativesearchService.removeFilter(contributorId);
  }

  public changeCollaborationState(contributorId): void {
    const collaborationState = this.collaborativesearchService.isEnable(contributorId);
    if (collaborationState) {
      this.collaborativesearchService.disable(contributorId);
    } else {
      this.collaborativesearchService.enable(contributorId);
    }
  }

  public getCollaborationIcon(contributorId): string {
    return this.contibutorsIcons.get(contributorId);
  }

  public getContributorLabel(contributorId: string): string {
    let label = this.collaborativesearchService.registry.get(contributorId).getFilterDisplayName();
    if (label !== undefined) {
      const labelSplited = label.split('<=');
      if (labelSplited.length === 3) {
        label = labelSplited[1];
      }
      return label;
    } else {
      return '';
    }

  }

  public getChipColor(contributorId: string): string  {
    const collaborationState = this.collaborativesearchService.isEnable(contributorId);
    if (collaborationState) {
      return 'white';
    } else {
      return '#CED3D3';
    }
  }

  private retrieveCurrentCollaborations() {
    Array.from(this.contributors.keys()).forEach(contributorId => {
      const collaboration = this.collaborativesearchService.getCollaboration(contributorId);
      if (collaboration != null) {
        this.collaborations.add(contributorId);
      }
    });
  }

  private subscribeToFutureCollaborations() {
    this.collaborativesearchService.collaborationBus.subscribe(collaborationBus => {
      if (!collaborationBus.all) {
        const collaboration = this.collaborativesearchService.getCollaboration(collaborationBus.id);
        if (collaboration != null) {
          if ( collaborationBus.operation === 0) {
            this.collaborations.add(collaborationBus.id);
          } else if ( collaborationBus.operation === 1) {
            this.collaborations.delete(collaborationBus.id);
          }
        } else {
          this.collaborations.delete(collaborationBus.id);
        }
      } else {
        this.retrieveCurrentCollaborations();
      }
    });
  }

}
