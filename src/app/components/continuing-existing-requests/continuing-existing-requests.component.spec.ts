import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinuingExistingRequestsComponent } from './continuing-existing-requests.component';

describe('ContinuingExistingRequestsComponent', () => {
  let component: ContinuingExistingRequestsComponent;
  let fixture: ComponentFixture<ContinuingExistingRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinuingExistingRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinuingExistingRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
