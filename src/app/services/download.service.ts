import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DownloadSettings } from 'app/tools/download.interface';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { map } from 'rxjs';

@Injectable()
export class DownloadService {
  private downloadSettings: DownloadSettings = {};

  public constructor(
    private http: HttpClient,
    private arlasSettingsService: ArlasSettingsService
  ) { }

  /** describes the download process */
  public describe() {
    return this.http.get('assets/mock/proc/describe/download.json');
  }

  /**
   *
   * @param ids List of products ids
   * @param aoi WKT of all polygons
   * @param payload Values of the dynamic form
   */
  public download(ids: string[], aoi: string, payload: any) {
    console.log('ids:', ids);
    console.log('aois:', aoi);
    console.log('payload:', payload);
  }

  public getDownloadSettings(): DownloadSettings {
    return this.downloadSettings;
  }

  public setDownloadSettings(downloadSettings: DownloadSettings): void {
    this.downloadSettings = downloadSettings;
  }

  public load() {
    return this.http.get((this.arlasSettingsService.getSettings() as any)?.download.url, { responseType: 'text' })
      .pipe(
        map(c => {
          const downloads: DownloadSettings = JSON.parse(c);
          this.setDownloadSettings(downloads);
          console.log(this.getDownloadSettings());
          return downloads;
        })
      );
  }

  // public load(): Promise<any> {
  //   return this.http.get((this.arlasSettingsService.getSettings() as any)?.download.url, { responseType: 'text' })
  //     .pipe(map(c => {
  //       const downloads: DownloadSettings = JSON.parse(c);
  //       this.setDownloadSettings(downloads);
  //       console.log(this.getDownloadSettings());
  //       return downloads;
  //     })).toPromise()
  //     .catch((err: any) => Promise.resolve(null));

  // }
}
