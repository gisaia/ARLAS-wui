import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DownloadService {

  public constructor(private http: HttpClient) { }

  /** describes the download process */
  public describe() {
    return this.http.get('assets/mock/proc/describe/download.json');
  }

  public download(ids: string[], aois: string[], format: string, projection: string) {
    // todo : call the download service with the given parameters.
  }
}
