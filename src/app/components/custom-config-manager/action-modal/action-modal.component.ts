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

import { Component, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { PersistenceService } from 'arlas-wui-toolkit';
import { Observable, Subject, map, mergeMap } from 'rxjs';
import { ConfigListAction, ConfigListActionEnum } from '../../../services/custom-list.service';
import { ActivatedRoute } from '@angular/router';
import { DataWithLinks } from 'arlas-persistence-api';


@Component({
  selector: 'arlas-action-modal',
  templateUrl: './action-modal.component.html',
  styleUrls: ['./action-modal.component.css']
})
export class ActionModalComponent {

  public action: ConfigListAction;
  public value: string;
  public ConfigListActionEnum = ConfigListActionEnum;
  public default = false;

  public errorMessage = '';
  @Output() public saveNewConfig: Subject<{ name: string; useAsDefault: boolean; }> = new Subject();
  @Output() public updateConfig: Subject<{ name: string; useAsDefault: boolean; }> = new Subject();

  public constructor(
    @Inject(MAT_DIALOG_DATA) data: ConfigListAction,
    private dialogRef: MatDialogRef<ActionModalComponent>,
    private persistenceService: PersistenceService,
    private route: ActivatedRoute

  ) {
    this.action = data;
  }

  public duplicate(newName: string, configId: string) {
    this.duplicateAndRemoveDefault('config_list', configId, this.getFullName(newName))
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.dialogRef.close();
        },
        error: (error) => this.raiseError(error)
      });
  }

  public rename(newName: string, configId: string) {
    this.persistenceService.rename(configId, this.getFullName(newName)).subscribe({
      next: () => {
        this.errorMessage = '';
        this.dialogRef.close();
      },
      error: error => this.raiseError(error)
    });
  }

  public create(name: string, useAsDefault: boolean) {
    this.saveNewConfig.next({
      name,
      useAsDefault
    });
  }

  public update(name: string, useAsDefault: boolean) {
    this.updateConfig.next({
      name,
      useAsDefault
    });
  }

  public closeShare(event: [boolean, any]) {
    // update share is successful, close dialog
    if (event[0]) {
      this.dialogRef.close();
    }
  }

  public raiseError(err: any) {
    console.log(err);
    switch (err.status) {
      case 401:
        this.errorMessage = marker('Unauthorized to create a custom configuration, you need to log in');
        break;
      case 403:
        this.errorMessage = marker('Missing permissions to create a custom configuration');
        break;
      case 500:
        err.json().then(e => {
          if ((e.message as string).indexOf('already exists') > 0) {
            this.errorMessage = marker('A custom configuration with this name exists already, please choose another name');
          } else {
            this.errorMessage = marker('An error occurred, please try later');
          }
        });
        break;
      default:
        this.errorMessage = marker('An error occurred, please try later');
    }
  }

  private getFullName(name): string {
    const configId = !!this.route.snapshot.queryParamMap.get('config_id') ? this.route.snapshot.queryParamMap.get('config_id') : 'local';
    const fullName = configId + '_' + 'config_list' + '_' + name;
    return fullName;
  }
  private duplicateAndRemoveDefault(zone: string, id: string, newName?: string): Observable<DataWithLinks> {
    return this.persistenceService.get(id).pipe(
      map(data => {
        const configObj = JSON.parse(data.doc_value);
        configObj.useAsDefault = false;
        return this.persistenceService.create(zone, newName ? newName : 'Copy of ' + data.doc_key, JSON.stringify(configObj));
      }),
      mergeMap(a => a)
    );
  }
}


