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
import enComponents from 'arlas-web-components/assets/i18n/en.json';
import frComponents from 'arlas-web-components/assets/i18n/fr.json';
import enToolkit from 'arlas-wui-toolkit/assets/i18n/en.json';
import frToolkit from 'arlas-wui-toolkit/assets/i18n/fr.json';
import { Observable, forkJoin, of } from 'rxjs';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';
import { CONFIG_ID_QUERY_PARAM } from 'arlas-wui-toolkit/tools/utils';
import { NOT_CONFIGURED } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { map } from 'rxjs/internal/operators/map';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

export class CustomTranslateLoader implements TranslateLoader {

    constructor(private http: HttpClient, private arlasSettings: ArlasSettingsService,
        private persistenceService: PersistenceService) { }

    public getTranslation(lang: string): Observable<any> {
        const localI18nAdress = 'assets/i18n/' + lang + '.json?' + Date.now();
        const url = new URL(window.location.href);
        const settings = this.arlasSettings.getSettings();
        const usePersistence = (!!settings && !!settings.persistence && !!settings.persistence.url
            && settings.persistence.url !== '' && settings.persistence.url !== NOT_CONFIGURED);
        const configurationId = url.searchParams.get(CONFIG_ID_QUERY_PARAM);
        if (usePersistence && configurationId) {
            const localI18nObs = this.http.get(localI18nAdress);
            const externalI18nObs = this.persistenceService.get(configurationId)
                .pipe(mergeMap(configDoc => this.persistenceService
                    .getByZoneKey('i18n', configDoc.doc_key.concat('_').concat(lang))
                    .pipe(map(i18nDoc => i18nDoc.doc_value), catchError(e => of('{}')))));
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
                        // failed to retrieve requested language file, use default
                        observer.complete(); // => Default language is already loaded
                    }
                );
            });
        } else {
            return Observable.create(observer => {
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
            });
        }
    }
}
