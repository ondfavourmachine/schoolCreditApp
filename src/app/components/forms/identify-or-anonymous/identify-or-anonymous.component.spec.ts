import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyOrAnonymousComponent } from './identify-or-anonymous.component';

describe('IdentifyOrAnonymousComponent', () => {
  let component: IdentifyOrAnonymousComponent;
  let fixture: ComponentFixture<IdentifyOrAnonymousComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentifyOrAnonymousComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentifyOrAnonymousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
