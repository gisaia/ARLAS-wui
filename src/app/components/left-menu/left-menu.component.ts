import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MapService } from 'app/services/map.service';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService, ArlasSettingsService, ArlasStartupService, ArlasWalkthroughService,
  DownloadComponent,
  PersistenceService,
  ShareComponent, TagComponent
} from 'arlas-wui-toolkit';
import { Subject } from 'rxjs';

export interface MenuState {
  configs?: boolean;
}

@Component({
  selector: 'arlas-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {
  /**
   * @Input : Angular
   * List of collections displayed in the map
   */
  @Input() public collections: string[];

  /**
   * @Input : Angular
   * State of the left menu's buttons
   */
  @Input() public toggleStates: MenuState = {
    configs: false
  };
  /**
   * @Input : Angular
   * Whether to show the filter indicators on the Analytics Menu icons
   */
  @Input() public showIndicators: boolean;
  /**
   * @Output : Angular
   * Emits an event when the menu's buttons toggle state changes
   */
  @Output() public menuEventEmitter: Subject<MenuState> = new Subject();

  @ViewChild('share', { static: false }) private shareComponent: ShareComponent;
  @ViewChild('download', { static: false }) private downloadComponent: DownloadComponent;
  @ViewChild('tag', { static: false }) private tagComponent: TagComponent;

  public zendeskActive = false;

  public tagComponentConfig: any;
  public shareComponentConfig: any;
  public downloadComponentConfig: any;
  public isRefreshAnalyticsButton: boolean;
  public showDashboardsList = false;

  public constructor(
    protected walkthroughService: ArlasWalkthroughService,
    private settings: ArlasSettingsService,
    private collaborativeService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,
    protected arlasStartupService: ArlasStartupService,
    protected persistenceService: PersistenceService,
    private mapService: MapService
  ) {
  }

  public ngOnInit() {
    if (!this.arlasStartupService.emptyMode) {
      this.shareComponentConfig = this.configService.getValue('arlas.web.components.share');
      this.downloadComponentConfig = this.configService.getValue('arlas.web.components.download');
      this.tagComponentConfig = this.configService.getValue('arlas.tagger');
      this.zendeskActive = this.settings.getTicketingKey() ? true : false;
      this.isRefreshAnalyticsButton = this.configService.getValue('arlas-wui.web.app.refresh');
    }
    this.showDashboardsList = this.settings.settings.dashboards_shortcut ?? false;
  }

  /**
   * Shows/hides menu element
   */
  public show(element: string) {
    if (element === ('configs')) {
      this.toggleStates.configs = !this.toggleStates.configs;
    } else {
      this.toggleStates.configs = false;
    }
    this.menuEventEmitter.next(Object.assign({}, this.toggleStates));
  }

  /** When opening the dialog of layers to share, we specify the visibility status of all
   * layers so that we choose only the displayed ones */
  public displayShare() {
    this.shareComponent.openDialog(this.mapService.mapComponent.visibilityStatus);
  }

  public replayTour() {
    this.walkthroughService.resetTour();
    this.walkthroughService.startTour();
  }

  public displayDownload() {
    this.downloadComponent.openDialog();
  }

  public displayTag() {
    this.tagComponent.openDialog();
  }

  public displayTagManagement() {
    this.tagComponent.openManagement();
  }

  public refreshComponents() {
    const dataModel = this.collaborativeService.dataModelBuilder(this.collaborativeService.urlBuilder().split('filter=')[1]);
    this.collaborativeService.setCollaborations(dataModel);
  }
}
