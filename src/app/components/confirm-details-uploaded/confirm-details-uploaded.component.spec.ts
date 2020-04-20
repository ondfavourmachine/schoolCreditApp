import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDetailsUploadedComponent } from './confirm-details-uploaded.component';

describe('ConfirmDetailsUploadedComponent', () => {
  let component: ConfirmDetailsUploadedComponent;
  let fixture: ComponentFixture<ConfirmDetailsUploadedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDetailsUploadedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDetailsUploadedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
