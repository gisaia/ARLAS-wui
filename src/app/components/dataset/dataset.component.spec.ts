import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { MatChipsModule, MatDialogModule, MatIconModule, MatSnackBarModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DatasetComponent } from './dataset.component';
import { ArlasBookmarkService } from 'arlas-wui-toolkit/services/bookmark/bookmark.service';
import { ContributorService } from '../../services/contributors.service';
import { HttpModule } from '@angular/http';
import {
  ArlasConfigService,
  ArlasCollaborativesearchService,
  ArlasStartupService
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { HttpClientModule } from '../../../../node_modules/@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatChipsModule, MatDialogModule, MatIconModule, RouterModule, HttpModule,
        HttpClientModule, BrowserModule, RouterTestingModule, MatSnackBarModule
      ],
      declarations: [DatasetComponent],
      providers: [
        ArlasConfigService,
        ArlasCollaborativesearchService,
        ArlasStartupService,
        ArlasBookmarkService,
        ContributorService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
