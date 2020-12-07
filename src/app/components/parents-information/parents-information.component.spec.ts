import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentsInformationComponent } from './parents-information.component';

describe('ParentsInformationComponent', () => {
  let component: ParentsInformationComponent;
  let fixture: ComponentFixture<ParentsInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParentsInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentsInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
