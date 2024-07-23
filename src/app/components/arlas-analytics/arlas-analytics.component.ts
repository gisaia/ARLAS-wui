import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
   * Whether to show the analytics menu inside of this component. Useful for multi-windows views
   */
  public showMenu = false;

  public analyticsContributor: AnalyticsContributor;
  public spinner: { show: boolean; diameter: string; color: string; strokeWidth: number; };
  public showIndicators = false;

  public constructor(
    protected analyticsService: AnalyticsService,
    protected arlasStartupService: ArlasStartupService,
    private configService: ArlasConfigService,
    protected resultlistService: ResultlistService,
    private router: Router
  ) {
  }

  public ngOnInit(): void {
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      this.setSpinner();
      if (this.configService.getValue('arlas.web.options.indicators')) {
        this.showIndicators = true;
      }
    }

    // TODO: make sure it works when reloading
    // When visualizing just the list, open the list to have it displayed
    if (this.router.url === '/analytics' && this.analyticsService.activeTab === undefined) {
      this.analyticsService.selectTab(0);
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
