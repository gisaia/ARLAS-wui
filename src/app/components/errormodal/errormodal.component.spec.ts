import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorModalComponent } from './errormodal.component';
import { MatDialogModule } from '@angular/material';
import { ArlasWuiConfigService, ArlasWuiCollaborativesearchService } from 'app/services/arlaswui.startup.service';


describe('ErrorModalComponent', () => {
  let component: ErrorModalComponent;
  let fixture: ComponentFixture<ErrorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [ErrorModalComponent],
      providers: [ArlasWuiConfigService, ArlasWuiCollaborativesearchService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
