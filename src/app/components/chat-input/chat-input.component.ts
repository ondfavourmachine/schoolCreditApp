import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  Input,
  OnDestroy
} from "@angular/core";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { SuccessfulBVN } from "src/app/models/successfulBVN";
import { Subscription, TimeoutError } from "rxjs";
import { QuestionsAndAnswers } from "../../models/answersInterface";
import { Message } from "../../models/message";
import { timeout } from "rxjs/operators";

@Component({
  selector: "app-chat-input",
  templateUrl: "./chat-input.component.html",
  styleUrls: ["./chat-input.component.css"]
})
export class ChatInputComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output("sendMessage") sendMessage = new EventEmitter<
    string | number | Object
  >();
  @Input("action") action: string;
  @Output("readyToAnswerOrNot") readyToAnswerOrNot = new EventEmitter<string>();
  @Output("makeAnApiCall") makeAnApiCall = new EventEmitter<{
    typeOfApiCall: string;
    valToSend: string;
  }>();
  private PreventMemoryLeaks: {
    timeHasElapsed?: Subscription;
    InputToNumber?: Subscription;
  } = {};
  @ViewChild("inputFromUser") inputFromUser: ElementRef;
  private sendButton: boolean = false;
  inputSetToNumber: boolean = false;
  private QuestionsAreDone: boolean = false;
  private allAnswers: QuestionsAndAnswers = {
    currentRemovedQuestion: "",
    allRemovedQuestions: [],
    questionsAndAnswersToSend: {}
  };
  // private removedQuestions: Array<string> = []
  private ASKFORDOB = false;
  private readyToAnswerQuestions: boolean;
  public questionaireButton: boolean = false;
  public start: string = undefined;
  public userHasStartedQuestions = false;
  successFulBvn: SuccessfulBVN = {
    data: { name: "", date_of_birth: "" },
    message: "",
    status: false
    //restart
  };
  constructor(
    private chatservice: ChatService,
    private generalservice: GeneralService
  ) {}

  ngOnChanges() {}
  ngOnInit() {}

  ngAfterViewInit() {
    // this.PreventMemoryLeaks.InputToNumber = this.generalservice.disableInput$.subscribe(
    //   val => {
    //     if (val == "disable Input") {
    //       (this.inputFromUser
    //         .nativeElement as HTMLInputElement).disabled = true;
    //     }
    //   }
    // );
  }

  submit(event: KeyboardEvent) {
    // debugger;
    event.preventDefault();
    if (event instanceof KeyboardEvent) {
      const keyboardEvent = event as KeyboardEvent;
      this.handleKeyBoardSubmit(keyboardEvent);
    } else {
      this.handleClickEvent(event);
    }
  }

  //

  handleClickEvent(event: MouseEvent) {
    const input = this.inputFromUser.nativeElement as HTMLInputElement;
    let inputValue = input.value;
    if (this.action == "refChecking" && !this.sendButton) {
      this.newSendMessagesToDisplay({
        message: inputValue,
        direction: "right"
      });
      setTimeout(() => {
        this.newSendMessagesToDisplay({
          message: "Please give a moment to confirm",
          direction: "left"
        });
      }, 300);

      setTimeout(() => {
        this.makeAnApiCall.emit({
          typeOfApiCall: "check-ref",
          valToSend: inputValue
        });
      }, 1000);

      input.value = "";
      let test = sessionStorage.getItem("ref_no");
      this.sendButton = test == "undefined" ? false : true;
      if (this.sendButton) {
        // this.generalservice.toggleInput("disable Input");
      }
    }
  }

  handleKeyBoardSubmit(event: KeyboardEvent) {
    const input = event.srcElement as HTMLInputElement;
    // first check if the user is connected to the internet.
    // if he is not do 1.
    if (
      this.action == "refChecking" &&
      input.value.length == 8 &&
      !this.generalservice.checkIfUserIsOnline() &&
      event.code == "Enter"
    ) {
      this.newSendMessagesToDisplay({
        message: input.value,
        direction: "right"
      });
      setTimeout(() => {
        this.newSendMessagesToDisplay({
          message: `You seem to be offline. Please check your internet and try again!`,
          direction: "left"
        });
      }, 300);
    } else {
      // if he is connected then do all these
      if (this.action == "refChecking" && event.code == "Enter") {
        this.newSendMessagesToDisplay({
          message: input.value,
          direction: "right"
        });
        setTimeout(() => {
          this.newSendMessagesToDisplay({
            message: "Please give a moment to confirm",
            direction: "left"
          });
        }, 500);
        this.makeAnApiCall.emit({
          typeOfApiCall: "check-ref",
          valToSend: input.value
        });
        input.value = "";
        let test = sessionStorage.getItem("ref_no");
        this.sendButton = test == "undefined" ? false : true;

        if (this.sendButton) {
          // this.generalservice.toggleInput("disable Input");
        }
      }
    }
  }

  caseUserNotInterestedInAnsweringQuestions(input: HTMLInputElement) {
    this.questionaireButton = input.value.toLowerCase() == "y" ? true : false;
    if (input.value.toLowerCase() == "n") {
      setTimeout(() => {
        this.newSendMessagesToDisplay({
          message: `Ok, see you next time.`,
          direction: "left"
        });
      }, 500);
    }
  }

  public sendMessagesAfterClickingTheButton(event: MouseEvent) {
    if (this.inputSetToNumber) {
      console.log(event.srcElement);
    }
  }

  private newSendMessagesToDisplay(something: {
    message: string;
    direction: string;
    button?: string;
  }) {
    this.sendMessage.emit(something);
  }

  // handleQuestionAndAnswerSession(value: string) {
  //   // display to the screen the users input.
  //   this.newSendMessagesToDisplay({
  //     message: value,
  //     direction: "right"
  //   });
  //   const bvn_number = sessionStorage.getItem("BVN");
  //   const sendToBack = {
  //     bvn_number,
  //     answer: `${
  //       this.generalservice.displayedQuestions[
  //         this.generalservice.displayedQuestions.length - 1
  //       ].id_of_question
  //     },${value.toUpperCase()}`
  //   };
  //   console.log(sendToBack);
  //   // send notification for next question to come!
  // }

  // this function resets all chats
  resetAllChat(): void {
    setTimeout(() => {
      // this.generalservice.resetChatController("resetChat");
    }, 1000);
  }

  ngOnDestroy() {
    // this.PreventMemoryLeaks.timeHasElapsed.unsubscribe();
    // this.PreventMemoryLeaks.InputToNumber.unsubscribe();
    // this.questionaireButton = false;
  }
}
