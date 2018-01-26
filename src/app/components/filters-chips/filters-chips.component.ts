import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ConfigService, projType } from 'arlas-web-core';
import { AppComponent } from '../../app.component';
import { ContributorService } from '../../services/contributors.service';
import { Hits } from 'arlas-api';
import { Contributor } from 'arlas-web-core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit/services/startup/startup.service';

@Component({
  selector: 'arlas-filters-chips',
  templateUrl: './filters-chips.component.html',
  styleUrls: ['./filters-chips.component.css']
})
export class FiltersChipsComponent {

  public collaborations: Set<string> = new Set<string>();
  public contributors: Map<string, Contributor> = new Map<string, Contributor>();
  public contibutorsIcons: Map<string, string>;
  public countAll;

  constructor(private collaborativesearchService: ArlasCollaborativesearchService,
    private contributorService: ContributorService, private cdr: ChangeDetectorRef) {

    this.contributors = this.collaborativesearchService.registry;
    this.subscribeToFutureCollaborations();
    this.contibutorsIcons = this.contributorService.getAllContributorsIcons();

  }

  public removeCollaboration(contributorId: string): void {
    this.collaborativesearchService.removeFilter(contributorId);
    this.cdr.detectChanges();
  }

  public changeCollaborationState(contributorId): void {
    const collaborationState = this.collaborativesearchService.isEnable(contributorId);
    if (collaborationState) {
      this.collaborativesearchService.disable(contributorId);
    } else {
      this.collaborativesearchService.enable(contributorId);
    }
  }

  public removeAllFilters(): void {
    this.collaborativesearchService.removeAll();

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

  public getChipColor(contributorId: string): string {
    const collaboration = this.collaborativesearchService.getCollaboration(contributorId);
    if (collaboration != null) {
      const collaborationState = this.collaborativesearchService.isEnable(contributorId);
      if (collaborationState) {
        return '#FFF';
      } else {
        return '#BDBDBD';
      }
    }
  }

  public getChipBackgroundColor(contributorId: string): string {
    const collaboration = this.collaborativesearchService.getCollaboration(contributorId);
    if (collaboration != null) {
      if (this.collaborativesearchService.isEnable(contributorId)) {
        return '#FF4081';
      } else {
        return '#FFF';
      }
    }
  }

  private retrieveCurrentCollaborations() {
    Array.from(this.contributors.keys()).forEach(contributorId => {
      const collaboration = this.collaborativesearchService.getCollaboration(contributorId);
      if (collaboration != null) {
        this.collaborations.add(contributorId);
      } else {
        this.collaborations.delete(contributorId);
      }
    });
  }

  private subscribeToFutureCollaborations() {
    this.collaborativesearchService.collaborationBus.subscribe(collaborationBus => {
      this.collaborativesearchService.countAll.subscribe(count => this.countAll = this.formatWithSpace(count));
      if (!collaborationBus.all) {
        const collaboration = this.collaborativesearchService.getCollaboration(collaborationBus.id);
        if (collaboration != null) {
          if (collaborationBus.operation === 0) {
            this.collaborations.add(collaborationBus.id);
          } else if (collaborationBus.operation === 1) {
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

  public formatWithSpace(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

}
