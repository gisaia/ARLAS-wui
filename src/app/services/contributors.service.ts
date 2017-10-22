import { Injectable } from '@angular/core';

import { HistogramContributor } from 'arlas-web-contributors';
import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from './arlaswui.startup.service';
import { DateUnit, ChartType, DataType } from 'arlas-web-components';
import { Histogram } from '../models/histogram';

@Injectable()
export class ContributorService {

  private COMPONENTS_PATH = 'catalog.web.app.components';
  private DEFAULT_CHART_HEIGHT = 70;
  private HISTOGRAM = 'histogram';
  private TIMELINE_CONTRIBUTOR_ID = 'timeline';
  private FILTER_HISTOGRAMS = 'Filter';
  private SECOND = 'second';
  private ONE_DIMENSION = 'onedimension';
  private AREA = 'area';
  private BARS = 'bars';

  public constructor(private configService: ArlasWuiConfigService,
    public collaborativeService: ArlasWuiCollaborativesearchService
  ) { }

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
          this.collaborativeService,
          this.configService,
          histogram.isOneDimension
        );

        if (contributorId.endsWith(this.FILTER_HISTOGRAMS)) {
          histogram.isFilter = true;
        }
        histograms.push(histogram);
      }
    });

    return histograms;
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
