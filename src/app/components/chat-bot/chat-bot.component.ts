import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnDestroy
} from "@angular/core";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { GeneralService } from "src/app/services/generalService/general.service";
// import { timeout } from "rxjs/operators";
import { DisplayQuestion } from "src/app/models/Questionaire";
import { Router, NavigationEnd } from "@angular/router";
import { TimeoutError, Subscription } from "rxjs";
// import { ValidateRefResponse } from "../../models/validaterRefRes";

@Component({
  selector: "app-chat-bot",
  templateUrl: "./chat-bot.component.html",
  styleUrls: ["./chat-bot.component.css"]
})
export class ChatBotComponent implements OnInit, AfterViewInit, OnDestroy {
  messages: string | { message: string; direction: string; button?: string };
  public referenceNumber: string;
  private destroyAnything: Subscription;
  actionToTake: string;
  @ViewChild("parentContainer") parentContainer: ElementRef;
  // timeHasElapsed: number = 0;
  constructor(
    private chatservice: ChatService,
    private generalservice: GeneralService,
    private router: Router,
    private changeDetection: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.ngOnInit();
        this.ngAfterViewInit();
      }
    });
    this.destroyAnything = this.generalservice.startAskingAndChangeQuestions$.subscribe(
      val => {
        // do something here
      },
      err => console.log(err)
    );

    this.changeDetection.detectChanges();
  }

  ngAfterViewInit() {
    const div = this.parentContainer.nativeElement as HTMLDivElement;
    const scoller = document.querySelector(".chat-box");
    const chat = document.querySelector(".chat_window");
    chat.addEventListener("DOMNodeInserted", e => {
      scoller.scrollBy({
        left: 0,
        top: scoller.scrollHeight,
        behavior: "smooth"
      });
    });
  }

  sendMessageFromInput(event) {
    this.messages = event;
  }

  handleReadyOrNot(event: string) {
    event = event.toLowerCase();
    switch (event) {
      case "y":
        setTimeout(() => {
          this.sendMessageFromInput({
            message: `Awesome! Please be aware that you will be timed. 
          Try to answer as fast and as truthfully as you can. Your time starts now!`,
            direction: "left"
          });
          this.generalservice.timerController("showTimer");
          this.userWantsToStartAnsweringQuestions();
        }, 1000);
        // this.userWantsToStartAnsweringQuestions();
        break;
      case "n":
        break;
    }
  }

  changeActionInput(event: string) {
    this.actionToTake = event;
    // console.log(this.actionToTake);
  }

  userWantsToStartAnsweringQuestions() {
    setTimeout(() => {
      this.userHasStartedQuestions();
    }, 1500);
  }

  // this function will kick start the sending of questions to the display component!
  userHasStartedQuestions() {
    setTimeout(() => {
      this.generalservice.handleQuestioningProcess("start");
      this.generalservice.timerController("startTimer");
    }, 1000);
  }

  showUserQuestions(temp: Array<DisplayQuestion>): void {
    setTimeout(() => {
      this.sendMessageFromInput({
        message: `${temp[0].question} 
         ${temp[0].options}
           `,
        direction: "left"
      });
      temp.splice(0, 1);
    }, 500);
  }

  // this function will restart the questioning process
  // when it receives an event from app-chat-messages-display restartProcess eventEmitter
  callNgOnInitAgain() {
    sessionStorage.clear();
    this.ngOnInit();
  }

  ngOnDestroy() {
    // this.destroyAnything.unsubscribe();
  }
}
