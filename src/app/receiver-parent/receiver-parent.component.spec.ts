import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiverParentComponent } from './receiver-parent.component';

describe('ReceiverParentComponent', () => {
  let component: ReceiverParentComponent;
  let fixture: ComponentFixture<ReceiverParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiverParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiverParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
