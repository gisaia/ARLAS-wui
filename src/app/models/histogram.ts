import { HistogramContributor } from 'arlas-web-contributors';
import { DateUnit, ChartType, Position } from 'arlas-web-components';

export class Histogram {
  public histogramContributor: HistogramContributor;
  public chartType: ChartType;
  public dateUnit: DateUnit.second | DateUnit.millisecond = DateUnit.second;
  public title: string;
  public isOneDimension = false;
  public isFilter = false;
  public chartHeight: number;
  public paletteColor = 'white';
  public icon: string;
  public multiselectable = false;
}
