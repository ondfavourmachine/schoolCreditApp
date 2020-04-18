import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsCtrlComponent } from './questions-ctrl.component';

describe('QuestionsCtrlComponent', () => {
  let component: QuestionsCtrlComponent;
  let fixture: ComponentFixture<QuestionsCtrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionsCtrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
