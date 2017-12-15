import { isBoolean } from 'util';
import { Injectable } from '@angular/core';

import { HistogramContributor, MapContributor, ChipsSearchContributor, SwimLaneContributor } from 'arlas-web-contributors';
import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from './arlaswui.startup.service';
import { Contributor } from 'arlas-web-core';

import { DateUnit, ChartType, DataType } from 'arlas-web-components';
import { drawType } from '../utils/utils';
import { Histogram } from '../models/histogram';

import { Subject } from 'rxjs/Subject';

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

  public constructor(private configService: ArlasWuiConfigService,
    public collaborativeService: ArlasWuiCollaborativesearchService
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

  public getTimelineContributor(): HistogramContributor {
    const timelineContributor = new HistogramContributor(this.TIMELINE_CONTRIBUTOR_ID,
      this.getDateUnit(this.TIMELINE_COMPONENT),
      DataType.time,
      this.collaborativeService,
      this.configService
    );
    this.arlasContributors.set(this.TIMELINE_CONTRIBUTOR_ID, timelineContributor);
    this.contributorsIcons.set(this.TIMELINE_CONTRIBUTOR_ID, this.getContributorIcon(this.TIMELINE_COMPONENT));
    return timelineContributor;
  }

  public getSwimlaneContributor(filterSuffix: string = ''): SwimLaneContributor {
    const swimLaneContributor = new SwimLaneContributor(this.SWIMLANE_CONTRIBUTOR_ID + filterSuffix,
      this.getDateUnit(this.SWIMLANE_COMPONENT + filterSuffix),
      DataType.time,
      this.collaborativeService,
      this.configService
    );
    swimLaneContributor.aggregations = this.configService.getValue(
      this.CONTRIBUTORS_PATH + '.' + this.SWIMLANE_COMPONENT + filterSuffix + '.aggregationmodel'
    );

    swimLaneContributor.field = 'time';
    this.arlasContributors.set(this.SWIMLANE_CONTRIBUTOR_ID + filterSuffix, swimLaneContributor);
    this.contributorsIcons.set(
      this.SWIMLANE_CONTRIBUTOR_ID + filterSuffix,
      this.getContributorIcon(this.SWIMLANE_COMPONENT + filterSuffix)
    );
    return swimLaneContributor;
  }

  /**
   * returns all the analytics histograms (thumbnails and filters)
   * Histogram object contains as properties:
   * - the contributor
   * - the inputs for arlas-histogram component
   */
  public getHistograms(): Array<Histogram> {
    const histograms: Array<Histogram> = new Array<Histogram>();

    Object.keys(this.configService.getValue(this.CONTRIBUTORS_PATH)).forEach(contributor => {
      const histogram = new Histogram();
      const contributorMD = contributor.split('$');
      const contributorType = contributorMD[0];
      const contributorId = contributorMD[1];

      if (contributorType === this.HISTOGRAM && contributorId !== this.TIMELINE_CONTRIBUTOR_ID) {
        histogram.dateUnit = this.getDateUnit(contributor);
        histogram.chartType = this.getChartType(contributor);
        histogram.title = this.getTitle(contributor);
        histogram.chartHeight = this.getChartHeight(contributor);
        histogram.multiselectable = this.getMultiSelectable(contributor);
        if (histogram.chartType === ChartType.oneDimension) {
          histogram.isOneDimension = true;
          histogram.paletteColor = this.getPaletteColor(contributor);
        }
        histogram.histogramContributor = new HistogramContributor(contributorId,
          histogram.dateUnit,
          DataType.numeric,
          this.collaborativeService,
          this.configService,
          histogram.isOneDimension
        );

        this.arlasContributors.set(contributorId, histogram.histogramContributor);
        this.contributorsIcons.set(contributorId, this.getContributorIcon(contributor));

        if (contributorId.endsWith(this.FILTER_HISTOGRAMS)) {
          histogram.isFilter = true;
        }
        histogram.icon = this.getContributorIcon(this.HISTOGRAM_PACKAGE + contributorId);
        histograms.push(histogram);
      }
    });

    return histograms;
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
