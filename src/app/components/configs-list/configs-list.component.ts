import { Component, OnInit, Input, Output } from '@angular/core';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { DataResource, DataWithLinks } from 'arlas-persistence-api';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';
import { Subject } from 'rxjs';

export const ZONE_WUI_BUILDER = 'config.json';

export interface Configuration {
  id: string;
  name: string;
  color: string;
}

@Component({
  selector: 'arlas-configs-list',
  templateUrl: './configs-list.component.html',
  styleUrls: ['./configs-list.component.scss']
})
export class ConfigsListComponent implements OnInit {
  public configurations: Array<Configuration> = new Array();
  public hubUrl;
  public listResolved = false;
  public retrieveData = true;
  @Output() public openHubEventEmitter: Subject<boolean> = new Subject();

  constructor(
    private persistenceService: PersistenceService,
    private arlasColorGeneratorLoader: ArlasColorGeneratorLoader,
    private arlasSettingsService: ArlasSettingsService
  ) {
    this.hubUrl = this.arlasSettingsService.getArlasHubUrl();
  }

  public ngOnInit() {
    this.getConfigList();
  }

  /**
   * Opens the given url in a new tab
   * @param url url to open
   */
  public navigate(url: string) {
    window.open(url, '_blank');
    // emit this event to let know app.component that the component container should be closed
    this.openHubEventEmitter.next(true);
  }

  public switchConf(confId) {
    window.location.href = '/?config_id=' + confId;
  }

  /**
   * Gets the configurations list
   */
  public getConfigList() {
    this.listResolved = false;
    this.persistenceService.list(ZONE_WUI_BUILDER, 10, 1, 'desc')
      .subscribe({
        next: (result: DataResource) => {
          this.listResolved = true;
          if (!!result.data) {
            result.data.forEach((d: DataWithLinks) => {
              const config: Configuration = {
                id: d.id,
                name: d.doc_key,
                color: this.arlasColorGeneratorLoader.getColor(d.id.concat(d.doc_key))
              };
              this.configurations.push(config);
            });
          }
        },
        error: (msg) => {
          this.listResolved = true;
          this.retrieveData = false;
        }
      });
  }
}
