import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  ArlasConfigService, ArlasIamService, ArlasSettingsService, ArlasWalkthroughService, AuthentificationService,
  DownloadComponent, PersistenceService, ShareComponent, TagComponent, UserInfosComponent
} from 'arlas-wui-toolkit';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AboutComponent } from '../about/about.component';
import { Router } from '@angular/router';

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
  public authentMode = 'false';
  public pages: Page[] = [];
  public name: string;
  public avatar: string;
  public reduce: string;
  public expand: string;
  public isLabelDisplayed = false;

  public constructor(
    private authentService: AuthentificationService,
    private arlasIamService: ArlasIamService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public persistenceService: PersistenceService,
    private configService: ArlasConfigService,
    public walkthroughService: ArlasWalkthroughService,
    public settings: ArlasSettingsService,
    private router: Router
  ) {
    this.extraAboutText = this.translate.instant('extraAboutText') === 'extraAboutText' ? '' : this.translate.instant('extraAboutText');
    this.aboutFile = 'assets/about/about_' + this.translate.currentLang + '.md?' + Date.now() + '.md';
    this.window = window;
    this.reduce = this.translate.instant('reduce');
    this.expand = this.translate.instant('expand');
    this.isAuthentActivated = !!this.authentService.authConfigValue && this.authentService.authConfigValue.use_authent;

    const isOpenID = this.isAuthentActivated && this.arlasIamService.authConfigValue.auth_mode !== 'iam';
    const isIam = this.isAuthentActivated && this.arlasIamService.authConfigValue.auth_mode === 'iam';
    this.isAuthentActivated = isOpenID || isIam;
    if (isOpenID) {
      this.authentMode = 'openid';
    }
    if (isIam) {
      this.authentMode = 'iam';
    }
    if (!this.isEmptyMode) {
      this.shareComponentConfig = this.configService.getValue('arlas.web.components.share');
      this.downloadComponentConfig = this.configService.getValue('arlas.web.components.download');
      this.tagComponentConfig = this.configService.getValue('arlas.tagger');
      this.zendeskActive = this.settings.getTicketingKey() ? true : false;
    }
  }

  public ngOnInit() {
    if (this.authentMode === 'openid') {
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
    }
    if (this.authentMode === 'iam') {
      this.arlasIamService.currentUserSubject.subscribe({
        next: (data) => {
          if (!!data) {
            this.connected = true;
            this.name = data?.user.email;
            this.avatar = this.getInitials(this.name);
          } else {
            this.connected = false;
            this.name = '';
            this.avatar = '';
          }
        },
        error: () => {
          this.connected = false;
        }
      });
    }

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
    if (this.authentMode === 'openid') {
      if (this.connected) {
        this.authentService.logout();
      } else {
        this.authentService.login();
      }
    }
    if (this.authentMode === 'iam') {
      if (this.connected) {
        this.arlasIamService.logout(['/']);
      } else {
        this.router.navigate(['login']);
      }
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

  /** When opening the dialog of layers to share, we specify the visibility status of all
   * layers so that we choose only the displayed ones */
  public displayShare() {
    this.shareComponent.openDialog(this.layersVisibilityStatus);
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

  public getInitials(name) {

    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.width = 32;
    canvas.height = 32;
    document.body.appendChild(canvas);


    const context = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 16;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = '#999';
    context.fill();
    context.font = '16px Arial';
    context.fillStyle = '#eee';

    if (name && name !== '') {
      const first = name[0];
      context.fillText(first.toUpperCase(), 10, 23);
      const data = canvas.toDataURL();
      document.body.removeChild(canvas);
      return data;
    } else {
      return '';
    }
  }

}
