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

import { Routes, RouterModule } from '@angular/router';
import { ArlasMapComponent } from './components/arlas-map/arlas-map.component';
import { NgModule } from '@angular/core';
import { MainAppComponent } from './components/main-app/main-app.component';

export const ROUTES: Routes = [
  { path: '', component: MainAppComponent  },
  { path: 'map', component: ArlasMapComponent }
];
export const routing = RouterModule.forRoot(ROUTES);

@NgModule({
  imports: [routing],
  exports: [RouterModule]
})
export class AppRoutingModule { }
