import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentAccountFormComponent } from './parent-account-form.component';

describe('ParentAccountFormComponent', () => {
  let component: ParentAccountFormComponent;
  let fixture: ComponentFixture<ParentAccountFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParentAccountFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentAccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
