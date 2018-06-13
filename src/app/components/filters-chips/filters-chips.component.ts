/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Contributor } from 'arlas-web-core';
import { ShareComponent } from 'arlas-wui-toolkit/components/share/share.component';
import { TagComponent } from 'arlas-wui-toolkit/components/tag/tag.component';
import { ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit/services/startup/startup.service';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import { ContributorService } from '../../services/contributors.service';
import { AboutComponent } from '../about/about.component';
import { DatasetComponent } from '../dataset/dataset.component';

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

  public tagComponenentConfig: any;
  public shareComponentConfig: any;

  @ViewChild('about') private aboutcomponent: AboutComponent;
  @ViewChild('share') private shareComponent: ShareComponent;
  @ViewChild('tag') private tagComponent: TagComponent;
  @ViewChild('dataset') private datasetComponent: DatasetComponent;

  constructor(
    private collaborativesearchService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    private configService: ArlasConfigService,
    private cdr: ChangeDetectorRef
  ) {

    this.contributors = this.collaborativesearchService.registry;
    this.subscribeToFutureCollaborations();
    this.contibutorsIcons = this.contributorService.getAllContributorsIcons();
    this.tagComponenentConfig = this.configService.getValue('arlas.web.components.tag');
    this.shareComponentConfig = this.configService.getValue('arlas.web.components.share');
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

  public displayAbout() {
    this.aboutcomponent.openDialog();
  }

  public displayShare() {
    this.shareComponent.openDialog();
  }

  public displayTag() {
    this.tagComponent.openDialog();
  }

  public displayBookmark() {
    this.datasetComponent.openDialog();
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
