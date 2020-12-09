import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankPartnershipComponent } from './bank-partnership.component';

describe('BankPartnershipComponent', () => {
  let component: BankPartnershipComponent;
  let fixture: ComponentFixture<BankPartnershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankPartnershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankPartnershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
