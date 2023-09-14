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

import { TestBed } from '@angular/core/testing';

import { UserPreferencesService } from './user-preferences.service';
import { ArlasCollaborativesearchService, AuthentificationService, GET_OPTIONS, getOptionsFactory } from 'arlas-wui-toolkit';
import { OAuthModule, ValidationHandler } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';


describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        OAuthModule.forRoot(),
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: GET_OPTIONS,
          useValue: getOptionsFactory,
          deps: [AuthentificationService]
        },
        {
          provide: ValidationHandler,
          useClass: JwksValidationHandler
        },
        HttpClient,
        ArlasCollaborativesearchService,
      ]
    });
    service = TestBed.inject(UserPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
