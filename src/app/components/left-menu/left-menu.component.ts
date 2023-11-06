import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService, ArlasSettingsService, ArlasStartupService, ArlasWalkthroughService,
  DownloadComponent, PersistenceService, ShareComponent, TagComponent
} from 'arlas-wui-toolkit';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Page {
  link: string;
  name: string;
  icon: string;
  disabled?: boolean;
}
export interface MenuState {
  configs?: boolean;
}

@Component({
  selector: 'arlas-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {

  @Input() public version: string;
  @Input() public collections: string[];

  @Input() public toggleStates: MenuState = {
    configs: false
  };
  @Input() public isEmptyMode;
  @Input() public layersVisibilityStatus: Map<string, boolean> = new Map();
  @Input() public showIndicators: boolean;
  @Output() public menuEventEmitter: Subject<MenuState> = new Subject();

  @ViewChild('share', { static: false }) private shareComponent: ShareComponent;
  @ViewChild('download', { static: false }) private downloadComponent: DownloadComponent;
  @ViewChild('tag', { static: false }) private tagComponent: TagComponent;

  public window;
  public zendeskActive = false;

  public tagComponentConfig: any;
  public shareComponentConfig: any;
  public downloadComponentConfig: any;
  public isRefreshAnalyticsButton: boolean;
  public sideNavState = false;
  public linkText = false;
  public pages: Page[] = [];
  public reduce: string;
  public expand: string;
  public isLabelDisplayed = false;

  public constructor(
    private translate: TranslateService,
    public persistenceService: PersistenceService,
    public walkthroughService: ArlasWalkthroughService,
    public settings: ArlasSettingsService,
    public collaborativeService: ArlasCollaborativesearchService,
    public configService: ArlasConfigService,
    public arlasStartUpService: ArlasStartupService
  ) {
    this.window = window;
    this.reduce = this.translate.instant('reduce');
    this.expand = this.translate.instant('expand');
  }

  public ngOnInit() {
    if (!this.version) {
      this.version = environment.VERSION;
    }
    if (!this.isEmptyMode) {
      this.shareComponentConfig = this.configService.getValue('arlas.web.components.share');
      this.downloadComponentConfig = this.configService.getValue('arlas.web.components.download');
      this.tagComponentConfig = this.configService.getValue('arlas.tagger');
      this.zendeskActive = this.settings.getTicketingKey() ? true : false;
      this.isRefreshAnalyticsButton = this.configService.getValue('arlas-wui.web.app.refresh');
    }
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

  public expandMenu() {
    this.isLabelDisplayed = !this.isLabelDisplayed;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  /** When opening the dialog of layers to share, we specify the visibility status of all
   * layers so that we choose only the displayed ones */
  public displayShare() {
    this.shareComponent.openDialog(this.layersVisibilityStatus);
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
