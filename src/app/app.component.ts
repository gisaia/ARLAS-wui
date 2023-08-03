/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ArlasCollaborativesearchService, ArlasColorGeneratorLoader, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { SharedWorkerBusService } from 'windows-communication-bus';
import { CollectionReferenceParameters } from 'arlas-api';
import { zip } from 'rxjs';
import { ArlasMapComponent } from './components/arlas-map/arlas-map.component';
import {
  ResultListContributor, MapContributor
} from 'arlas-web-contributors';
import { ContributorService } from './services/contributors.service';
import { ResultlistService } from './services/resultlist.service';


@Component({
  selector: 'arlas-wui-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class ArlasWuiComponent implements OnInit {
  public collections = [];
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();
  public resultlistContributors: Array<ResultListContributor> = new Array();
  @Input() public hiddenResultlistTabs: string[] = [];

  @ViewChild('arlasmap', { static: false }) public arlasMapComponent: ArlasMapComponent;

  public constructor(private configService: ArlasConfigService,
    private sharedWorkerBusService: SharedWorkerBusService,
    public collaborativeService: ArlasCollaborativesearchService,
    private resultlistService: ResultlistService,
    public arlasStartUpService: ArlasStartupService,
    private colorGenerator: ArlasColorGeneratorLoader,
    private contributorService: ContributorService,
  ) {

  }
  public ngOnInit(): void {
    if (typeof SharedWorker !== 'undefined') {
      this.sharedWorkerBusService.setSharedWorker(new SharedWorker(new URL('./app.worker', import.meta.url), {
        'name': 'multi-fenetre-poc'
      }));
    } else {
      // Shared Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
    /** Retrieve displayable resultlists */
    const hiddenListsTabsSet = new Set(this.hiddenResultlistTabs);
    const allResultlists = this.configService.getValue('arlas.web.components.resultlists');
    const allContributors = this.configService.getValue('arlas.web.contributors');
    const resultListsConfig = !!allResultlists ? allResultlists.filter(a => {
      const contId = a.contributorId;
      const tab = allContributors.find(c => c.identifier === contId).name;
      return !hiddenListsTabsSet.has(tab);
    }) : [];

    const ids = new Set(resultListsConfig.map(c => c.contributorId));
    this.arlasStartUpService.contributorRegistry.forEach((v, k) => {
      if (v instanceof ResultListContributor) {
        v.updateData = ids.has(v.identifier);
        this.resultlistContributors.push(v);
      }
    });
    this.resultlistService.setContributors(this.resultlistContributors);
    this.collections = [...new Set(Array.from(this.collaborativeService.registry.values()).map(c => c.collection))];
    zip(...this.collections.map(c => this.collaborativeService.describe(c)))
      .subscribe(cdrs => {
        cdrs.forEach(cdr => {
          this.collectionToDescription.set(cdr.collection_name, cdr.params);
        });
        this.resultlistService.setCollectionsDescription(this.collectionToDescription);
        if (!!this.arlasMapComponent) {
          const bounds = (<mapboxgl.Map>this.arlasMapComponent.mapComponent.map).getBounds();
          (<mapboxgl.Map>this.arlasMapComponent.mapComponent.map).fitBounds(bounds, { duration: 0 });
        }
        if (this.resultlistContributors.length > 0) {
          this.resultlistContributors.forEach(c => c.sort = this.collectionToDescription.get(c.collection).id_path);
        }
        this.contributorService.getMapContributors().forEach(mapContrib => {
          mapContrib.colorGenerator = this.colorGenerator;
          if (!!this.resultlistContributors) {
            const resultlistContrbutor: ResultListContributor = this.resultlistContributors
              .find(resultlistContrib => resultlistContrib.collection === mapContrib.collection);
            if (!!resultlistContrbutor) {
              mapContrib.searchSize = resultlistContrbutor.pageSize;
              mapContrib.searchSort = resultlistContrbutor.sort;
            } else {
              mapContrib.searchSize = 50;
            }
          }
        });
      });
  }
}
