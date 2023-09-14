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

import { Component, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Resource } from 'arlas-permissions-api';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActionModalComponent } from '../action-modal/action-modal.component';
import { PermissionService, PersistenceService } from 'arlas-wui-toolkit';
import { ConfigListAction, ConfigListActionEnum } from '../../../services/custom-list.service';

@Component({
  selector: 'arlas-config-menu',
  templateUrl: './config-menu.component.html',
  styleUrls: ['./config-menu.component.css']
})
export class ConfigMenuComponent implements OnInit {
  @Input() public actions: Array<ConfigListAction>;
  @Input() public zone: string;

  @Output() public actionExecutedEmitter = new Subject();

  public ConfigListActionEnum = ConfigListActionEnum;
  public canCreateCustomConfig = false;

  public constructor(
    private dialog: MatDialog,
    private persistenceService: PersistenceService,
    private permissionService: PermissionService
  ) {

  }
  public ngOnInit() {
    this.permissionService.get('persist/resource/').subscribe((resources: Resource[]) => {
      this.canCreateCustomConfig = (resources.filter(r => r.verb === 'POST').length > 0);
    });
  }

  public onActionClick(action: ConfigListAction): void {
    switch (action.type) {
      case ConfigListActionEnum.VIEW: {
        this.actionExecutedEmitter.next(action);
        break;
      }
      case ConfigListActionEnum.DELETE: {
        // Open a confirm modal to validate this choice. Available only if updatable is true for this object
        this.getDialogRef(action).subscribe(id => {
          this.persistenceService.get(id).subscribe(
            data => {
              const key = data.doc_key;
              this.persistenceService.delete(id).subscribe(() => this.actionExecutedEmitter.next(action));
            });
        });
        break;
      }
      case ConfigListActionEnum.SET_AS_DEFAULT:
      case ConfigListActionEnum.EDIT: {
        this.actionExecutedEmitter.next(action);
        break;
      }
      case ConfigListActionEnum.DUPLICATE:
      case ConfigListActionEnum.RENAME:
      case ConfigListActionEnum.SHARE: {
        if (action.config && action.config.id) {
          this.getDialogRef(action).subscribe(() => this.actionExecutedEmitter.next(action));
        }
        break;
      }
      default: {
        console.error('Unknown action');
        break;
      }
    }
  }

  private getDialogRef(action: ConfigListAction) {
    const dialogRef = this.dialog.open(ActionModalComponent, {
      disableClose: true,
      data: action
    });
    return dialogRef.afterClosed().pipe(filter(result => result !== false));
  }
}
