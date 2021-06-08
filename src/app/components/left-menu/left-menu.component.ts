import { Component, OnInit, Output, Input, ViewChild } from '@angular/core';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { UserInfosComponent } from 'arlas-wui-toolkit/components/user-infos/user-infos.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { Subject } from 'rxjs';
import { ShareComponent } from 'arlas-wui-toolkit/components/share/share.component';
import { ArlasConfigService } from 'arlas-wui-toolkit';
import { environment } from '../../../environments/environment';
import { AboutComponent } from '../about/about.component';
import { ArlasWalkthroughService } from 'arlas-wui-toolkit/services/walkthrough/walkthrough.service';
import { DownloadComponent } from 'arlas-wui-toolkit/components/download/download.component';
import { TagComponent } from 'arlas-wui-toolkit/components/tag/tag.component';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';

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
  @Input() public toggleStates: MenuState = {
    configs: false
  };
  @Input() public isEmptyMode;
  @Output() public menuEventEmitter: Subject<MenuState> = new Subject();

  @ViewChild('share', { static: false }) private shareComponent: ShareComponent;
  @ViewChild('about', { static: false }) private aboutcomponent: AboutComponent;
  @ViewChild('download', { static: false }) private downloadComponent: DownloadComponent;
  @ViewChild('tag', { static: false }) private tagComponent: TagComponent;

  public window;
  public zendeskActive = false;

  public tagComponentConfig: any;
  public shareComponentConfig: any;
  public downloadComponentConfig: any;

  public aboutFile: string;
  public extraAboutText: string;

  public sideNavState = false;
  public linkText = false;
  public connected;
  public isAuthentActivated;
  public pages: Page[] = [];
  public name: string;
  public avatar: string;
  public reduce: string;
  public expand: string;
  public isLabelDisplayed = false;


  constructor(private authentService: AuthentificationService, private dialog: MatDialog, private translate: TranslateService,
    public persistenceService: PersistenceService, private configService: ArlasConfigService,
    public walkthroughService: ArlasWalkthroughService,
    public settings: ArlasSettingsService
  ) {
    this.extraAboutText = this.translate.instant('extraAboutText') === 'extraAboutText' ? '' : this.translate.instant('extraAboutText');
    this.aboutFile = 'assets/about/about_' + this.translate.currentLang + '.md?' + Date.now() + '.md';
    this.window = window;
    this.reduce = this.translate.instant('reduce');
    this.expand = this.translate.instant('expand');
    this.isAuthentActivated = !!this.authentService.authConfigValue && !!this.authentService.authConfigValue.use_authent;
    if (!this.isEmptyMode) {
      this.shareComponentConfig = this.configService.getValue('arlas.web.components.share');
      this.downloadComponentConfig = this.configService.getValue('arlas.web.components.download');
      this.tagComponentConfig = this.configService.getValue('arlas.tagger');
      this.zendeskActive = this.settings.getTicketingKey() ? true : false;
    }
  }

  public ngOnInit() {
    const claims = this.authentService.identityClaims as any;
    this.authentService.canActivateProtectedRoutes.subscribe(isConnected => {
      this.connected = isConnected;
      if (isConnected) {
        this.name = claims.nickname;
        this.avatar = claims.picture;
      } else {
        this.name = '';
        this.avatar = '';
      }
    });

    if (!this.version) {
      this.version = environment.VERSION;
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
  public connect() {
    if (this.connected) {
      this.authentService.logout();
    } else {
      this.authentService.login();
    }
  }

  public getUserInfos() {
    this.dialog.open(UserInfosComponent);
  }

  public expandMenu() {
    this.isLabelDisplayed = !this.isLabelDisplayed;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  public displayShare() {
    this.shareComponent.openDialog();
  }

  public displayAbout() {
    this.aboutcomponent.openDialog();
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

}
