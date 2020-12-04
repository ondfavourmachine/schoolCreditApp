import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildInformationFormsComponent } from './child-information-forms.component';

describe('ChildInformationFormsComponent', () => {
  let component: ChildInformationFormsComponent;
  let fixture: ComponentFixture<ChildInformationFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildInformationFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildInformationFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
