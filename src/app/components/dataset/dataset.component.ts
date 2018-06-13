import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ArlasBookmarkService } from 'arlas-wui-toolkit/services/bookmark/bookmark.service';
import { BookmarkDataSource } from 'arlas-wui-toolkit/services/bookmark/bookmarkDataSource';

@Component({
  selector: 'arlas-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent {

  @Input() public icon = 'share';

  constructor(
    public dialog: MatDialog
  ) { }

  public openDialog() {
    this.dialog.open(DatasetDialogComponent, { width: '800px' });
  }

}

@Component({
  selector: 'arlas-dataset-dialog',
  templateUrl: './dataset-dialog.component.html',
  styleUrls: ['./dataset-dialog.component.css']
})
export class DatasetDialogComponent {

  public datasets: BookmarkDataSource;
  public columnsToDisplay = ['date', 'name', 'type', 'color', 'count'];

  constructor(private bookmarkService: ArlasBookmarkService) {
    this.datasets = new BookmarkDataSource(this.bookmarkService.dataBase);
  }
}
