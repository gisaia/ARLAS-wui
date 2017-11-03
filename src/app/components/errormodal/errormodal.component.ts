import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from '../../services/arlaswui.startup.service';



@Component({
  selector: 'arlas-errormodal',
  templateUrl: './errormodal.component.html',
  styleUrls: ['./errormodal.component.css']
})
export class ErrorModalComponent implements OnInit {

  public dialogRef: MatDialogRef<any>;

  constructor(public dialog: MatDialog, private configService: ArlasWuiConfigService,
    private collaborativeService: ArlasWuiCollaborativesearchService) { }

  public ngOnInit() {
    this.configService.confErrorBus
      .bufferWhen(() => this.configService.confErrorBus.debounceTime(5000))
      .subscribe(k => {
        this.openDialog();
        const listError = [];
        k.forEach(m => listError.push('Key configuration problem : \n' + m + ' missing'));
        this.dialogRef.componentInstance.messages = listError;
      });
    this.collaborativeService.collaborationErrorBus
      .bufferWhen(() => this.collaborativeService.collaborationErrorBus.debounceTime(5000))
      .subscribe(response => {
        this.openDialog();
        this.dialogRef.componentInstance.messages = response;
      });
  }

  public openDialog() {
    this.dialogRef = this.dialog.open(ErrorModalMsgComponent);
  }

}

@Component({
  selector: 'arlas-errormodal-msg',
  templateUrl: './errormodalmsg.component.html',
})
export class ErrorModalMsgComponent {
  public messages: Array<string>;
  constructor(public dialogRef: MatDialogRef<ErrorModalMsgComponent>) { }
}
