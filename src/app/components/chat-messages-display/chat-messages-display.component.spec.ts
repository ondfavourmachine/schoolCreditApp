import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessagesDisplayComponent } from './chat-messages-display.component';

describe('ChatMessagesDisplayComponent', () => {
  let component: ChatMessagesDisplayComponent;
  let fixture: ComponentFixture<ChatMessagesDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatMessagesDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessagesDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
