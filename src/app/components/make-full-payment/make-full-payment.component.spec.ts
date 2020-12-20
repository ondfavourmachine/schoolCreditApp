import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeFullPaymentComponent } from './make-full-payment.component';

describe('MakeFullPaymentComponent', () => {
  let component: MakeFullPaymentComponent;
  let fixture: ComponentFixture<MakeFullPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeFullPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeFullPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
