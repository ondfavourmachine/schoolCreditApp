import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditParentInfoComponent } from './edit-parent-info.component';

describe('EditParentInfoComponent', () => {
  let component: EditParentInfoComponent;
  let fixture: ComponentFixture<EditParentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditParentInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditParentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
