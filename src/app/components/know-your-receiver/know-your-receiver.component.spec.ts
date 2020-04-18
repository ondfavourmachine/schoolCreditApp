import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowYourReceiverComponent } from './know-your-receiver.component';

describe('KnowYourReceiverComponent', () => {
  let component: KnowYourReceiverComponent;
  let fixture: ComponentFixture<KnowYourReceiverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowYourReceiverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowYourReceiverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
