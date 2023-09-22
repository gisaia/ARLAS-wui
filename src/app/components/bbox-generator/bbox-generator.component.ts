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

import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, merge, mergeMap, of } from 'rxjs';

@Component({
  selector: 'arlas-bbox-generator',
  templateUrl: './bbox-generator.component.html',
  styleUrls: ['./bbox-generator.component.scss']
})
export class BboxGeneratorComponent implements OnInit, AfterViewInit {
  public DESCRIPTION = 'Enter coordinates in decimal or sexagesimal degrees';
  public bboxForm: BboxFormGroup;

  public constructor(private cdr: ChangeDetectorRef
  ) {
  }

  public ngOnInit(): void {
    this.bboxForm = new BboxFormGroup();
  }
  public ngAfterViewInit(): void {
    this.cdr.detectChanges();
    console.log(this.bboxForm);
  }

}

export class BboxFormGroup extends FormGroup {
  public firstCorner: PointFormGroup;
  public secondCorner: PointFormGroup;

  public constructor() {
    const firstCorner = new PointFormGroup();
    const secondCorner = new PointFormGroup();
    super({
      firstCorner,
      secondCorner
    });
    this.firstCorner = firstCorner;
    this.secondCorner = secondCorner;

  }
}

export class PointFormGroup extends FormGroup {

  public latitude: FormControl;
  public longitude: FormControl;

  public latitudeChanges$: Observable<any>;
  public longitudesChanges$: Observable<any>;

  public constructor() {
    const latitude = new FormControl( );
    const longitude = new FormControl();
    super({
      latitude,
      longitude
    });
    this.latitude = latitude;
    this.longitude = longitude;

    merge(this.latitude.valueChanges, this.longitude.valueChanges).pipe(
      // mergeMap(v => {
      //   return v;
      // })
    ).subscribe(r => console.log(r));

    this.latitude.valueChanges.subscribe(r => console.log(r));
  }
}


