import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityChecksComponent } from './eligibility-checks.component';

describe('EligibilityChecksComponent', () => {
  let component: EligibilityChecksComponent;
  let fixture: ComponentFixture<EligibilityChecksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EligibilityChecksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EligibilityChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
