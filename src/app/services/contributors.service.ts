import { isBoolean } from 'util';
import { Injectable } from '@angular/core';

import { HistogramContributor, MapContributor, ChipsSearchContributor, SwimLaneContributor } from 'arlas-web-contributors';
import { Contributor } from 'arlas-web-core';

import { DateUnit, ChartType, DataType } from 'arlas-web-components';

import { Subject } from 'rxjs/Subject';
import {
  ArlasConfigService,
  ArlasCollaborativesearchService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';

@Injectable()
export class ContributorService {

  public arlasContributors = new Map<string, Contributor>();
  public contributorsIcons = new Map<string, string>();

  public CONTRIBUTORS_PATH = 'arlas.web.contributors';
  public ID_PATH = 'arlas-wui.web.app.idFieldName';
  public DEFAULT_CHART_HEIGHT = 70;
  public MAPCONTRIBUTOR_ID = 'mapbox';
  public MAP_COMPONENT = 'map$mapbox';
  public CHIPSSEARCH_ID = 'chipssearch';
  public CHIPSSEARCH_COMPONENT = 'chipsearch$chipssearch';

  public constructor(private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private arlasStartupService: ArlasStartupService
  ) { }

  /* returns the map contributor */
  public getMapContributor(onRemoveBbox: Subject<boolean>, redrawTile: Subject<boolean>): MapContributor {
    const mapglcontributor = new MapContributor(this.MAPCONTRIBUTOR_ID,
      onRemoveBbox,
      redrawTile,
      this.collaborativeService,
      this.configService
    );
    this.arlasContributors.set(this.MAPCONTRIBUTOR_ID, mapglcontributor);
    this.contributorsIcons.set(this.MAPCONTRIBUTOR_ID, this.getContributorIcon(this.MAP_COMPONENT));
    return mapglcontributor;
  }

  public getChipSearchContributor(sizeOnBackspaceBus: Subject<boolean>): ChipsSearchContributor {
    const chipsSearchContributor = new ChipsSearchContributor(this.CHIPSSEARCH_ID,
      sizeOnBackspaceBus,
      this.collaborativeService,
      this.configService
    );
    this.arlasContributors.set(this.CHIPSSEARCH_ID, chipsSearchContributor);
    this.contributorsIcons.set(this.CHIPSSEARCH_ID, this.getContributorIcon(this.CHIPSSEARCH_COMPONENT));
    return chipsSearchContributor;
  }

  public getArlasContributors(): Map<string, Contributor> {
    return this.arlasContributors;
  }

  public getContributor(contributorId: string): Contributor {
    return this.arlasContributors.get(contributorId);
  }

  public getAllContributorsIcons(): Map<string, string> {
    this.arlasStartupService.contributorRegistry.forEach((v, k) => {
      if (v !== undefined) {
        this.contributorsIcons.set(
          k,
          this.configService.getValue((<Contributor>v).getPackageName() + '$' + k + '.icon')
        );
      }
    });

    return this.contributorsIcons;
  }

  private getContributorIcon(contributorMD: string) {
    return this.configService.getValue(this.CONTRIBUTORS_PATH + '.' + contributorMD + '.icon');
  }
}
