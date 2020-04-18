import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsTextComponent } from './questions-text.component';

describe('QuestionsTextComponent', () => {
  let component: QuestionsTextComponent;
  let fixture: ComponentFixture<QuestionsTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionsTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
