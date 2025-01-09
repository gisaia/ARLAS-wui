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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResultlistService } from 'app/services/resultlist.service';
import { PROTECTED_IMAGE_HEADER } from 'arlas-web-components';
import { Attributes, IntersectionObserverHooks } from 'ng-lazyload-image';
import { map, ObservableInput } from 'rxjs';


@Injectable()
/** L: a layer class/interface.
 *  S: a source class/interface.
 *  M: a Map configuration class/interface.
 */
export class LazyLoadImageHooks<L, S, M> extends IntersectionObserverHooks {
  private readonly http: HttpClient;

  public constructor(
    http: HttpClient,
    private readonly resultListService: ResultlistService<L, S, M>
  ) {
    super();
    this.http = http;
  }

  public override loadImage(attributes: Attributes): ObservableInput<string> {
    if (this.resultListService.isThumbnailProtected()) {
      // Load the image through `HttpClient` Angular system to pass inside the JwtInterceptor
      // to load the thumbnail with the authentication token
      const getParams: {
        headers?: HttpHeaders | { [header: string]: string | string[]; };
        responseType: 'blob';
      } = { responseType: 'blob' };
      getParams.headers = { [PROTECTED_IMAGE_HEADER]: 'true' };
      return this.http.get(attributes.imagePath, getParams).pipe(map(blob => URL.createObjectURL(blob)));
    } else {
      // If the thumbnail is not protected, lazyload it normally
      return super.loadImage(attributes);
    }
  }
}
