import { isBoolean } from 'util';
import { Injectable } from '@angular/core';

import { HistogramContributor, MapContributor, ChipsSearchContributor, SwimLaneContributor } from 'arlas-web-contributors';
import { Contributor } from 'arlas-web-core';

import { DateUnit, ChartType, DataType } from 'arlas-web-components';
import { drawType } from '../utils/utils';
import { Histogram } from '../models/histogram';

import { Subject } from 'rxjs/Subject';
import { ArlasConfigService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

@Injectable()
export class ContributorService {

  public arlasContributors = new Map<string, Contributor>();
  public contributorsIcons = new Map<string, string>();

  public CONTRIBUTORS_PATH = 'arlas.web.contributors';
  public ID_PATH = 'arlas-wui.web.app.idFieldName';
  public DEFAULT_CHART_HEIGHT = 70;
  public HISTOGRAM = 'histogram';
  public HISTOGRAM_PACKAGE = 'histogram$';
  public MAPCONTRIBUTOR_ID = 'mapbox';
  public MAP_COMPONENT = 'map$mapbox';
  public CHIPSSEARCH_ID = 'chipssearch';
  public CHIPSSEARCH_COMPONENT = 'chipssearch$chipssearch';
  public TIMELINE_CONTRIBUTOR_ID = 'timeline';
  public TIMELINE_COMPONENT = 'histogram$timeline';
  public SWIMLANE_CONTRIBUTOR_ID = 'airline';
  public SWIMLANE_COMPONENT = 'swimlane$airline';
  public FILTER_HISTOGRAMS = 'Filter';
  public SECOND = 'second';
  public ONE_DIMENSION = 'onedimension';
  public AREA = 'area';
  public BARS = 'bars';

  public constructor(private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService
  ) { }

  /* returns the map contributor */
  public getMapContributor(onRemoveBbox: Subject<boolean>, redrawTile: Subject<boolean>, drawTypes: drawType): MapContributor {
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
    return this.contributorsIcons;
  }

  private getContributorIcon(contributorMD: string) {
    return this.configService.getValue(this.CONTRIBUTORS_PATH + '.' + contributorMD + '.icon');
  }

  private getDateUnit(contributor: string): DateUnit.second | DateUnit.millisecond {
    const dateUnitConf = this.configService.getValue(this.CONTRIBUTORS_PATH + '.' + contributor + '.dateunit');
    if (dateUnitConf === this.SECOND) {
      return DateUnit.second;
    } else {
      return DateUnit.millisecond;
    }
  }


  private getChartType(contributor: string): ChartType {
    const chartTypeConf = this.configService.getValue(this.CONTRIBUTORS_PATH + '.' + contributor + '.charttype');
    if (chartTypeConf === this.BARS) {
      return ChartType.bars;
    } else if (chartTypeConf === this.ONE_DIMENSION) {
      return ChartType.oneDimension;
    } else {
      return ChartType.area;
    }
  }

  private getTitle(contributor: string): string {
    return this.configService.getValue(this.CONTRIBUTORS_PATH + '.' + contributor + '.title');
  }

  private getMultiSelectable(contributor: string): boolean {
    const isMultiSelectable = this.configService.getValue(this.CONTRIBUTORS_PATH + '.' + contributor + '.multiselectable');
    if (isMultiSelectable === 'true') {
      return true;
    } else {
      return false;
    }
  }

  private getChartHeight(contributor: string): number {
    const height = +this.configService.getValue(this.CONTRIBUTORS_PATH + '.' + contributor + '.height');
    if (height.toString() === 'NaN') {
      return this.DEFAULT_CHART_HEIGHT;
    } else {
      return height;
    }
  }

  private getPaletteColor(contributor: string): string {
    const paletteColor = this.configService.getValue(this.CONTRIBUTORS_PATH + '.' + contributor + '.palettecolor');
    if (paletteColor === undefined) {
      return 'white';
    } else {
      return paletteColor;
    }
  }
}
