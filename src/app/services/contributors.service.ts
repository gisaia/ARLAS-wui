import { Injectable } from '@angular/core';

import { HistogramContributor, MapContributor, ChipsSearchContributor } from 'arlas-web-contributors';
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

  private COMPONENTS_PATH = 'catalog.web.app.components';
  private ID_PATH = 'catalog.web.app.fieldsConfiguration.idFieldName';
  private DEFAULT_CHART_HEIGHT = 70;
  private HISTOGRAM = 'histogram';
  private MAPCONTRIBUTOR_ID = 'mapbox';
  private MAP_COMPONENT = 'map$mapbox';
  private CHIPSSEARCH_ID = 'chipsseach';
  private CHIPSSEARCH_COMPONENT = 'chipssearch$chipssearch';
  private TIMELINE_CONTRIBUTOR_ID = 'timeline';
  private TIMELINE_COMPONENT = 'histogram$timeline';
  private FILTER_HISTOGRAMS = 'Filter';
  private SECOND = 'second';
  private ONE_DIMENSION = 'onedimension';
  private AREA = 'area';
  private BARS = 'bars';

  public constructor(private configService: ArlasWuiConfigService,
    public collaborativeService: ArlasWuiCollaborativesearchService
  ) { }

  /* returns the map contributor */
  public getMapContributor(onRemoveBbox: Subject<boolean>, redrawTile: Subject<boolean>, drawTypes: drawType): MapContributor {
    const mapglcontributor = new MapContributor(this.MAPCONTRIBUTOR_ID,
      this.configService.getValue(this.ID_PATH),
      onRemoveBbox,
      redrawTile,
      drawTypes,
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

  /**
   * returns all the analytics histograms (thumbnails and filters)
   * Histogram object contains as properties:
   * - the contributor
   * - the inputs for arlas-histogram component
   */
  public getHistograms(): Array<Histogram> {
    const histograms: Array<Histogram> = new Array<Histogram>();

    Object.keys(this.configService.getValue(this.COMPONENTS_PATH)).forEach(contributor => {
      const histogram = new Histogram();
      const contributorMD = contributor.split('$');
      const contributorType = contributorMD[0];
      const contributorId = contributorMD[1];

      if (contributorType === this.HISTOGRAM && contributorId !== this.TIMELINE_CONTRIBUTOR_ID) {
        histogram.dateUnit = this.getDateUnit(contributor);
        histogram.chartType = this.getChartType(contributor);
        histogram.title = this.getTitle(contributor);
        histogram.chartHeight = this.getChartHeight(contributor);

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
        histograms.push(histogram);
      }
    });

    return histograms;
  }

  public getArlasContributors(): Map<string, Contributor> {
    return this.arlasContributors;
  }

  public getContributor(contributorId: string):  Contributor {
    return this.arlasContributors.get(contributorId);
  }

  public getAllContributorsIcons(): Map<string, string> {
    return this.contributorsIcons;
  }

  private getContributorIcon(contributorMD: string) {
    return this.configService.getValue(this.COMPONENTS_PATH + '.' + contributorMD + '.icon');
  }

  private getDateUnit(contributor: string): DateUnit.second | DateUnit.millisecond {
    const dateUnitConf = this.configService.getValue(this.COMPONENTS_PATH + '.' + contributor + '.dateunit');
    if (dateUnitConf === this.SECOND) {
      return DateUnit.second;
    } else {
      return DateUnit.millisecond;
    }
  }


  private getChartType(contributor: string): ChartType {
    const chartTypeConf = this.configService.getValue(this.COMPONENTS_PATH + '.' + contributor + '.charttype');
    if (chartTypeConf === this.BARS) {
      return ChartType.bars;
    } else if (chartTypeConf === this.ONE_DIMENSION) {
      return ChartType.oneDimension;
    } else {
      return ChartType.area;
    }
  }

  private getTitle(contributor: string): string {
    return this.configService.getValue(this.COMPONENTS_PATH + '.' + contributor + '.title');
  }

  private getChartHeight(contributor: string): number {
    const height = +this.configService.getValue(this.COMPONENTS_PATH + '.' + contributor + '.height');
    if (height.toString() === 'NaN') {
      return this.DEFAULT_CHART_HEIGHT;
    } else {
      return height;
    }
  }

  private getPaletteColor(contributor: string): string {
    const paletteColor = this.configService.getValue(this.COMPONENTS_PATH + '.' + contributor + '.palettecolor');
    if (paletteColor === undefined) {
      return 'white';
    } else {
      return paletteColor;
    }
  }
}
