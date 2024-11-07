import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientRecordDetailsComponent } from './patient-record-details.component';

describe('PatientRecordDetailsComponent', () => {
  let component: PatientRecordDetailsComponent;
  let fixture: ComponentFixture<PatientRecordDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientRecordDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientRecordDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
