import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsProgressBarComponent } from './questions-progress-bar.component';

describe('QuestionsProgressBarComponent', () => {
  let component: QuestionsProgressBarComponent;
  let fixture: ComponentFixture<QuestionsProgressBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionsProgressBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
