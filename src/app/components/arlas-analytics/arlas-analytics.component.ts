import { Component, Input, OnInit } from '@angular/core';
import { ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { AnalyticsContributor } from 'arlas-web-contributors';

@Component({
  selector: 'arlas-analytics',
  templateUrl: './arlas-analytics.component.html',
  styleUrls: ['./arlas-analytics.component.css']
})
export class ArlasAnalyticsComponent implements OnInit {

  @Input() public hiddenAnalyticsTabs: string[] = [];

  public analyticsContributor: AnalyticsContributor;
  public analytics: Array<any>;
  public spinner: { show: boolean; diameter: string; color: string; strokeWidth: number; };
  public showIndicators = false;

  public constructor(
    private arlasStartUpService: ArlasStartupService,
    private configService: ArlasConfigService
  ) {
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      this.analyticsContributor = this.arlasStartUpService.contributorRegistry.get('analytics') as AnalyticsContributor;
      this.setSpinner();
      this.setIndicator();
    }
  }

  public ngOnInit(): void {
    this.setAnalytics();
  }

  private setSpinner() {
    const spinnerConfiguration = this.configService.getValue('arlas.web.options.spinner');
    if (!!spinnerConfiguration) {
      this.spinner = spinnerConfiguration;
    } else {
      this.spinner = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };
    }
  }

  private setIndicator() {
    if (this.configService.getValue('arlas.web.options.indicators')) {
      this.showIndicators = true;
    }
  }

  private setAnalytics() {
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      /** Retrieve displayable analytics */
      const hiddenAnalyticsTabsSet = new Set(this.hiddenAnalyticsTabs);
      const allAnalytics = this.configService.getValue('arlas.web.analytics');
      this.analytics = !!allAnalytics ? allAnalytics.filter(a => !hiddenAnalyticsTabsSet.has(a.tab)) : [];
    }
  }

}
