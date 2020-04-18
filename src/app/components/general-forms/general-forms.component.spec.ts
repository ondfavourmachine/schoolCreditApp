import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralFormsComponent } from './general-forms.component';

describe('GeneralFormsComponent', () => {
  let component: GeneralFormsComponent;
  let fixture: ComponentFixture<GeneralFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
