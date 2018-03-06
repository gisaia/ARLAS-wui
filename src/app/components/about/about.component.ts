import { Component, Output, Input, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'arlas-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

  @Input() pathToMd: string;
  @Input() displayLink = false;
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

