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

import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'arlas-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

  @Input() public pathToMd: string;
  @Input() public displayLink = false;
  public dialogRef: MatDialogRef<AboutDialogComponent>;

  constructor(public dialog: MatDialog) { }

  public openDialog() {
    this.dialogRef = this.dialog.open(AboutDialogComponent);
    this.dialogRef.componentInstance.pathToMd = this.pathToMd;
  }
}

@Component({
  selector: 'arlas-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.css']
})
export class AboutDialogComponent {

  public pathToMd: string;

  constructor(public dialogRef: MatDialogRef<AboutDialogComponent>) {

  }
}

