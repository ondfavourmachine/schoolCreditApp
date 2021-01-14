import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyParentDataComponent } from './verify-parent-data.component';

describe('VerifyParentDataComponent', () => {
  let component: VerifyParentDataComponent;
  let fixture: ComponentFixture<VerifyParentDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyParentDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyParentDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
