import { Component, Input, OnInit } from '@angular/core';
import { ResultlistService } from '@services/resultlist.service';
import { AnalyticsContributor } from 'arlas-web-contributors';
import { AnalyticsService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';

@Component({
  selector: 'arlas-analytics',
  templateUrl: './arlas-analytics.component.html',
  styleUrls: ['./arlas-analytics.component.scss']
})
export class ArlasAnalyticsComponent implements OnInit {
  /**
   * @Input : Angular
   * Whether to show the analytics menu inside of this component. Useful for multi-windows views
   */
  @Input() public showMenu = false;

  public analyticsContributor: AnalyticsContributor;
  public spinner: { show: boolean; diameter: string; color: string; strokeWidth: number; };
  public showIndicators = false;

  public constructor(
    protected analyticsService: AnalyticsService,
    protected arlasStartupService: ArlasStartupService,
    private configService: ArlasConfigService,
    protected resultlistService: ResultlistService
  ) {
  }

  public ngOnInit(): void {
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      this.setSpinner();
      if (this.configService.getValue('arlas.web.options.indicators')) {
        this.showIndicators = true;
      }
    }
  }

  private setSpinner() {
    const spinnerConfiguration = this.configService.getValue('arlas.web.options.spinner');
    if (!!spinnerConfiguration) {
      this.spinner = spinnerConfiguration;
    } else {
      this.spinner = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };
    }
  }
}
