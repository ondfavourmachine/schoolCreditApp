import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiverBankAccountComponent } from './receiver-bank-account.component';

describe('ReceiverBankAccountComponent', () => {
  let component: ReceiverBankAccountComponent;
  let fixture: ComponentFixture<ReceiverBankAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiverBankAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiverBankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
