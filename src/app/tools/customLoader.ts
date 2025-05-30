/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import enMap from 'arlas-map/assets/i18n/en.json';
import esMap from 'arlas-map/assets/i18n/es.json';
import frMap from 'arlas-map/assets/i18n/fr.json';
import { DataWithLinks } from 'arlas-persistence-api';
import enComponents from 'arlas-web-components/assets/i18n/en.json';
import esComponents from 'arlas-web-components/assets/i18n/es.json';
import frComponents from 'arlas-web-components/assets/i18n/fr.json';
import {
  ArlasConfigService, ArlasSettingsService, CONFIG_ID_QUERY_PARAM,
  NOT_CONFIGURED, PersistenceService, WalkthroughLoader
} from 'arlas-wui-toolkit';
import enToolkit from 'arlas-wui-toolkit/assets/i18n/en.json';
import esToolkit from 'arlas-wui-toolkit/assets/i18n/es.json';
import frToolkit from 'arlas-wui-toolkit/assets/i18n/fr.json';
import { timeFormatDefaultLocale } from 'd3-time-format';
import enD3TimeLocal from 'd3-time-format/locale/en-US.json';
import esD3TimeLocal from 'd3-time-format/locale/es-ES.json';
import frD3TimeLocal from 'd3-time-format/locale/fr-FR.json';
import { firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';


export class ArlasWalkthroughLoader implements WalkthroughLoader {
  public constructor(
    private readonly http: HttpClient,
    private readonly arlasSettings: ArlasSettingsService,
    private readonly persistenceService: PersistenceService,
    private readonly configService: ArlasConfigService,
    private readonly translateService: TranslateService) {
  }
  public loader(): Promise<any> {
    const lang = this.translateService.currentLang ? this.translateService.currentLang : 'en';
    const localTourAdress = 'assets/tour/tour_' + lang + '.json?' + Date.now();
    const localTour = this.http.get(localTourAdress);
    const settings = this.arlasSettings.getSettings();
    const url = new URL(window.location.href);
    const usePersistence = (!!settings && !!settings.persistence && !!settings.persistence.url
      && settings.persistence.url !== '' && settings.persistence.url !== NOT_CONFIGURED);
    const configurationId = url.searchParams.get(CONFIG_ID_QUERY_PARAM);
    if (usePersistence && configurationId) {
      return firstValueFrom(this.persistenceService.get(configurationId)
        .pipe(mergeMap(configDoc => this.getTour(lang, configDoc, localTour))));
    } else {
      return firstValueFrom(localTour);
    }

  }

  private getTour(lang: string, config: any, localTour: Observable<any>): Observable<DataWithLinks> {
    const arlasConfig = this.configService.parse(config.doc_value);
    if (this.configService.hasTours(arlasConfig) && this.configService.getTours(arlasConfig)[lang]) {
      const toursId = this.configService.getTours(arlasConfig)[lang];
      return this.persistenceService.exists(toursId).pipe(mergeMap((exist) => {
        if (exist.exists) {

          return this.persistenceService.get(toursId)
            .pipe(map((tourDoc) => JSON.parse(tourDoc.doc_value)))
            .pipe(catchError((err) => localTour));
        }
        return localTour;
      }));
    }
    return localTour;
  }

}

export class ArlasTranslateLoader implements TranslateLoader {

  public constructor(
    private readonly http: HttpClient,
    private readonly arlasSettings: ArlasSettingsService,
    private readonly persistenceService: PersistenceService,
    private readonly configService: ArlasConfigService
  ) { }

  public getTranslation(lang: string): Observable<any> {
    const localI18nAdress = 'assets/i18n/' + lang + '.json?' + Date.now();
    const url = new URL(window.location.href);
    const settings = this.arlasSettings.getSettings();
    const usePersistence = (!!settings && !!settings.persistence && !!settings.persistence.url
      && settings.persistence.url !== '' && settings.persistence.url !== NOT_CONFIGURED);
    const configurationId = url.searchParams.get(CONFIG_ID_QUERY_PARAM);
    if (lang === 'fr') {
      timeFormatDefaultLocale(frD3TimeLocal as any);
    } else if (lang === 'en') {
      timeFormatDefaultLocale(enD3TimeLocal as any);
    } else if (lang === 'es') {
      timeFormatDefaultLocale(esD3TimeLocal as any);
    }
    if (usePersistence && configurationId) {
      const localI18nObs = this.http.get(localI18nAdress);
      const externalI18nObs = this.persistenceService.get(configurationId)
        .pipe(mergeMap(configDoc => this.getI18n(lang, configDoc, of('{}'))));
      return new Observable(observer => {
        forkJoin([localI18nObs, externalI18nObs]).subscribe(
          results => {
            const localI18n = results[0];
            const externalI18n = JSON.parse(results[1] as string);
            let merged = localI18n;
            // Properties in externalI18n will overwrite those in localI18n and frToolkit and frComponents .
            if (lang === 'fr') {
              merged = { ...frComponents, ...frMap, ...frToolkit, ...localI18n, ...externalI18n as Object };
            } else if (lang === 'en') {
              merged = { ...enComponents, ...enMap, ...enToolkit, ...localI18n, ...externalI18n as Object };
            } else if (lang === 'es') {
              merged = { ...esComponents, ...esMap, ...esToolkit, ...localI18n, ...externalI18n as Object };
            }
            observer.next(merged);
            observer.complete();
          },
          error => {
            this.mergeLocalI18n(localI18nAdress, lang, observer);
          }
        );
      });
    } else {
      return Observable.create(observer => {
        this.mergeLocalI18n(localI18nAdress, lang, observer);
      });
    }
  }

  private mergeLocalI18n(localI18nAdress, lang, observer) {
    this.http.get(localI18nAdress).subscribe(
      res => {
        let merged = res;
        // Properties in res will overwrite those in frToolkit and frComponents .
        if (lang === 'fr') {
          merged = { ...frComponents, ...frToolkit, ...res };
        } else if (lang === 'en') {
          merged = { ...enComponents, ...enToolkit, ...res };
        } else if (lang === 'es') {
          merged = { ...esComponents, ...esToolkit, ...res };
        }
        observer.next(merged);
        observer.complete();
      },
      error => {
        // failed to retrieve requested language file, use default
        observer.complete(); // => Default language is already loaded
      }
    );
  }

  private getI18n(lang: string, config: any, localTour: Observable<any>): Observable<string> {
    const arlasConfig = this.configService.parse(config.doc_value);
    if (this.configService.hasI18n(arlasConfig) && this.configService.getI18n(arlasConfig)[lang]) {
      const i18nId = this.configService.getI18n(arlasConfig)[lang];
      return this.persistenceService.exists(i18nId).pipe(mergeMap((exist) => {
        if (exist.exists) {
          return this.persistenceService.get(i18nId)
            .pipe(map((i18nDoc) => i18nDoc.doc_value))
            .pipe(catchError((err) => localTour));
        }
        return localTour;
      }));
    }
    return localTour;
  }
}
