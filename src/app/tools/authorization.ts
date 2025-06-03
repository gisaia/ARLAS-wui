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

import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArlasIamService, AuthentificationService, AuthentSetting } from 'arlas-wui-toolkit';
import { BehaviorSubject } from 'rxjs';



export function updateAuthorizationHeaders$(
  authentSetting: AuthentSetting, arlasIamService: ArlasIamService,
  authentService: AuthentificationService, destroyRef: DestroyRef
) {
  const obs = new BehaviorSubject<null | { [name: string]: string; }>(null);

  const authentMode = authentSetting?.auth_mode;
  const isAuthentActivated = !!authentSetting?.use_authent;
  if (isAuthentActivated) {
    if (authentMode === 'iam') {
      arlasIamService.tokenRefreshed$.pipe(takeUntilDestroyed(destroyRef)).subscribe({
        next: (loginData) => {
          if (loginData) {
            const org = arlasIamService.getOrganisation();
            const iamHeader = {
              Authorization: 'Bearer ' + loginData.access_token,
            };
            // Set the org filter only if the organisation is defined
            if (org) {
              iamHeader['arlas-org-filter'] = org;
            }
            obs.next(iamHeader);
          } else {
            obs.next(null);
          }
        }
      });
    } else {
      authentService.canActivateProtectedRoutes.pipe(takeUntilDestroyed(destroyRef)).subscribe(isConnected => {
        if (isConnected) {
          const headers = {
            Authorization: 'Bearer ' + authentService.accessToken
          };
          obs.next(headers);
        } else {
          obs.next(null);
        }
      });
    }
  } else {
    obs.next(null);
  }

  return obs;
}
