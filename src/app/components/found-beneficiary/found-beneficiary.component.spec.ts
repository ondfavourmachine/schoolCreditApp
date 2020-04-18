import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoundBeneficiaryComponent } from './found-beneficiary.component';

describe('FoundBeneficiaryComponent', () => {
  let component: FoundBeneficiaryComponent;
  let fixture: ComponentFixture<FoundBeneficiaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoundBeneficiaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoundBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
