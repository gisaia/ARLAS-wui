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
import enComponents from 'arlas-web-components/assets/i18n/en.json';
import frComponents from 'arlas-web-components/assets/i18n/fr.json';
import { ArlasSettingsService, CONFIG_ID_QUERY_PARAM, NOT_CONFIGURED, PersistenceService, WalkthroughLoader } from 'arlas-wui-toolkit';
import enToolkit from 'arlas-wui-toolkit/assets/i18n/en.json';
import frToolkit from 'arlas-wui-toolkit/assets/i18n/fr.json';
import { timeFormatDefaultLocale } from 'd3-time-format';
import enD3TimeLocal from 'd3-time-format/locale/en-US.json';
import frD3TimeLocal from 'd3-time-format/locale/fr-FR.json';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';


export class ArlasWalkthroughLoader implements WalkthroughLoader {
    constructor(private http: HttpClient, private arlasSettings: ArlasSettingsService,
        private persistenceService: PersistenceService, private translateService: TranslateService) {
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
            return this.persistenceService.get(configurationId)
            .pipe(mergeMap(configDoc => this.persistenceService
                .existByZoneKey('tour', configDoc.doc_key.concat('_').concat(lang))
                .pipe(mergeMap(exist => exist.exists ? this.persistenceService
                .getByZoneKey('tour', configDoc.doc_key.concat('_').concat(lang))
                .pipe(map(tourDoc => JSON.parse(tourDoc.doc_value))) : localTour), catchError(() => localTour)))).toPromise();
        } else {
            return localTour.toPromise();
        }
    }

}

export class ArlasTranslateLoader implements TranslateLoader {

    constructor(private http: HttpClient, private arlasSettings: ArlasSettingsService,
        private persistenceService: PersistenceService) { }

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
        }
        if (usePersistence && configurationId) {
            const localI18nObs = this.http.get(localI18nAdress);
            const externalI18nObs = this.persistenceService.get(configurationId)
                .pipe(mergeMap(configDoc => this.persistenceService
                    .existByZoneKey('i18n', configDoc.doc_key.concat('_').concat(lang))
                    .pipe(mergeMap(exist => exist.exists ? this.persistenceService
                    .getByZoneKey('i18n', configDoc.doc_key.concat('_').concat(lang))
                    .pipe(map(i18nDoc => i18nDoc.doc_value)) : of('{}')), catchError(e => of('{}')))));
            return Observable.create(observer => {
                forkJoin([localI18nObs, externalI18nObs]).subscribe(
                    results => {
                        const localI18n = results[0];
                        const externalI18n = JSON.parse(results[1] as string);
                        let merged = localI18n;
                        // Properties in externalI18n will overwrite those in localI18n and frToolkit and frComponents .
                        if (lang === 'fr') {
                            merged = { ...frComponents, ...frToolkit, ...localI18n, ...externalI18n as Object };
                        } else if (lang === 'en') {
                            merged = { ...enComponents, ...enToolkit, ...localI18n, ...externalI18n as Object };
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
}
