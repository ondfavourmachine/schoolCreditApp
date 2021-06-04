import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherLoanApplicationComponent } from './teacher-loan-application.component';

describe('TeacherLoanApplicationComponent', () => {
  let component: TeacherLoanApplicationComponent;
  let fixture: ComponentFixture<TeacherLoanApplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherLoanApplicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherLoanApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
