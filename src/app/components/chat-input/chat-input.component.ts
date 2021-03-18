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
import { Router } from "@angular/router";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

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
  private arrayOfRegexes: Array<RegExp> = [
    /hello/gi,
    /restart/gi,
    /start/gi,
    /go/gi, 
    /begin/gi, 
    /register/gi,
    /register child/gi,
    /continue previous/gi,
    /register account details/gi,
    /register account/gi,
    /hi/gi,
    /help/gi,
    /help my family/gi,
    /done/gi,
    /sent/gi,
    /need money/gi,
    /uploaded evidence/gi,
    /donated money/gi,
    /donated/gi,
    /completed/gi,
    /finished giving/gi
  ];
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
  public userHasStartedQuestions = false;
  successFulBvn: SuccessfulBVN = {
    data: { name: "", date_of_birth: "" },
    message: "",
    status: false
    //restart
  };
  constructor(
    private chatservice: ChatService,
    private generalservice: GeneralService,
    private router: Router
  ) {}

  ngOnChanges() {}
  ngOnInit() {}

  ngAfterViewInit() {
  }

  processAndRespondToUserInput(actualText: string, value: string) {
    (this.inputFromUser.nativeElement as HTMLInputElement).value = "";
    const typeOfUser = this.router.url;
    let newresponse: replyGiversOrReceivers;
    switch (actualText) {
      case "help":
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
          `Here is a list of commands you can type in for quick navigation around the system.`,
          `left`,
          "I want to be identified,Stay anonymous",
          "identify,anonymous",
          undefined,
          { classes: ["helper"] }
        );
        setTimeout(() => {
          this.generalservice.responseDisplayNotifier(
            new replyGiversOrReceivers(`${value}`, "right")
          );
        }, 300);
        break;
        case "hi":
        case "go":
        case "hello":
        case "start":
        case "begin":
        const chatresponse = actualText.toLowerCase() == 'hi' ? 'Hello' : 'Hi' ;
        newresponse = new replyGiversOrReceivers(`${value}`, "right");
        this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
          `${chatresponse}, welcome to this payment service. click any of the buttons below to begin`,
          `left`,
          "make a new request, Continue existing request",
          "newrequest,continuingrequest"
        );
        setTimeout(() => {
          this.generalservice.responseDisplayNotifier(newresponse);
        }, 400);
      break;
      
      case "school":
      case "give":
        if (typeOfUser.includes("school")) {
          const response = new replyGiversOrReceivers(`${value}`, "right");
          this.generalservice.nextChatbotReplyToGiver = null;
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `Seems, you want to get right to it. That's the spirit! Please click one of the buttons`,
            `left`,
            "I want to be identified,Stay anonymous",
            "identify,anonymous"
          );
          setTimeout(() => {
            this.generalservice.responseDisplayNotifier(response);
          }, 700);
        }
        break;
       case "restart":
        const response = new replyGiversOrReceivers(`${value}`, "right");
        this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
          `You asked to restart the process. This will lead to loosing all previous entries.
           Are you sure you want to restart?`,
          `left`,
          "Yes restart now, make new request, Continue existing request",
          "restart,newrequest,continuingrequest"
        );
        setTimeout(() => {
          this.generalservice.responseDisplayNotifier(response);
        }, 400);
        break;
      case 'register':
      newresponse = new replyGiversOrReceivers(`${value}`, "right");
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `Please click any of the buttons below to begin your registration`,
        `left`,
        "New registration, i have previously registered",
        "newrequest,continuingrequest"
      );
      setTimeout(() => {
        this.generalservice.responseDisplayNotifier(newresponse);
      }, 400); 
      break;
      case "register child":
      newresponse = new replyGiversOrReceivers(`${value}`, "right");
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `You asked to register a child. Please click any of the buttons below to begin`,
        `left`,
        "Yes restart now,make a new request, Continue existing request",
        "restart,newrequest,continuingrequest"
      );
      setTimeout(() => {
        this.generalservice.responseDisplayNotifier(newresponse);
      }, 400);

      break;
      case "continue a request":
      newresponse = new replyGiversOrReceivers(`${value}`, "right");
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `To continue an exiting request please click the button below.`,
        `left`,
        "Continue existing request",
        "continuingrequest"
      );
      setTimeout(() => {
        this.generalservice.responseDisplayNotifier(newresponse);
      }, 400);
      break;
      default:
          this.generalservice.nextChatbotReplyToGiver = undefined;
          const response2 = new replyGiversOrReceivers(`${value}`, "right");
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `Your entry is invalid! Here are a list of words that could help you quickly navigate the system.
             `,
            `left`,
            "I want to be identified,Stay anonymous", // please these buttons are completely useless and will not be presented in the dom
            "identify,anonymous",
            undefined,
            { classes: ["bot_helper_message"] }
          );
          setTimeout(() => {
            this.generalservice.responseDisplayNotifier(response2);
          }, 700);
      
    }
  }

  submit(event: KeyboardEvent) {
    event.preventDefault();
    //  i would remove this later
    event.stopPropagation();

    const input = event.srcElement as HTMLInputElement;
    if (event instanceof KeyboardEvent) {
      this.crossCheckUserInputWithRegexes(input.value);
    }
  }

  crossCheckUserInputWithRegexes(str: string) {
    let actualText: string, response: boolean;
    for (const regex of this.arrayOfRegexes) {
      if (regex.source.trim().toLowerCase() == str.trim().toLowerCase() || regex.test(str)) {
        response = true;
        actualText = regex.source;
        break;
      }
    }
    this.processAndRespondToUserInput(actualText, str);
  }

  //

  handleClickEvent(event) {
    event.preventDefault();
    if (event.screenY == 0) {
      return;
    } else {
      const input = this.inputFromUser.nativeElement as HTMLInputElement;
      this.crossCheckUserInputWithRegexes(input.value);
    }

    // this.crossCheckUserInputWithRegexes(input.value);
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

  // this function resets all chats
  resetAllChat(): void {
    setTimeout(() => {
      // this.generalservice.resetChatController("resetChat");
    }, 1000);
  }

  ngOnDestroy() {
    // this.PreventMemoryLeaks.timeHasElapsed.unsubscribe();
    // this.PreventMemoryLeaks.InputToNumber.unsubscribe();
  
  }
}
