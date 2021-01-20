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
    /hi/gi,
    /help/gi,
    /give/gi,
    /giver/gi,
    /receiver/gi,
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
    private generalservice: GeneralService,
    private router: Router
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

  processAndRespondToUserInput(actualText: string, value: string) {
    (this.inputFromUser.nativeElement as HTMLInputElement).value = "";
    const typeOfUser = this.router.url;
  
    switch (actualText) {
      case "help":
      case "help my family":
      case "need money":
      case "receiver":
        if (!typeOfUser.includes("giver")) {
          const response = new replyGiversOrReceivers(`${value}`, "right");
          // this.generalservice.nextChatbotReplyToGiver = null;
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `We are aware. Please click the button below to begin the process of receiving help.`,
            `left`,
            "I need monetary help",
            "help,"
          );
          setTimeout(() => {
            this.generalservice.responseDisplayNotifier(response);
          }, 700);
        } else {
          const response = new replyGiversOrReceivers(`${value}`, "right");
          this.generalservice.nextChatbotReplyToGiver = null;
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `I can't respond to your entry. If you want to give. Please click the buttons below.`,
            `left`,
            "I want to be identified,Stay anonymous",
            "identify,anonymous"
          );
          setTimeout(() => {
            this.generalservice.responseDisplayNotifier(response);
          }, 700);
        }
        break;
      case "hi":
      case "hello":
        const reply = actualText == "hi" ? "Hello" : "Hi";
        if (typeOfUser.includes("giver")) {
          const response = new replyGiversOrReceivers(`${value}`, "right");
          this.generalservice.nextChatbotReplyToGiver = null;
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `${reply}, It's nice to meet you. I know you're here to donate to a family or families in need. Please click one of the buttons to begin`,
            `left`,
            "I want to be identified,Stay anonymous",
            "identify,anonymous"
          );
          setTimeout(() => {
            this.generalservice.responseDisplayNotifier(response);
          }, 700);
        }
        break;
      case "done":
      case "completed":
      case "sent":
      case "finished giving":
      case "donated":
      case "donated money":
        if (
          !this.generalservice.justFinishedGiving &&
          typeOfUser.includes("giver")
        ) {
          const response = new replyGiversOrReceivers(`${value}`, "right");
          this.generalservice.nextChatbotReplyToGiver = null;
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `You have made an invalid entry! I am sure you intend to provide some financial assistance to a family or some families in need. Please click any of the buttons to continue`,
            `left`,
            "I want to be identified,Stay anonymous",
            "identify,anonymous"
          );
          setTimeout(() => {
            this.generalservice.responseDisplayNotifier(response);
          }, 700);
        } else {
          if (!typeOfUser.includes("giver")) return;

          const response = new replyGiversOrReceivers(`${value}`, "right");
          this.generalservice.nextChatbotReplyToGiver = null;
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `It is great that you provided help in this trying times!`,
            "left",
            "Give more money",
            "giveMoney"
          );
          setTimeout(() => {
            this.generalservice.responseDisplayNotifier(response);
          }, 700);
        }
        break;
      case "giver":
      case "give":
        if (typeOfUser.includes("giver")) {
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
      default:
        if (typeOfUser.includes("giver")) {
          
          const response = new replyGiversOrReceivers(`${value}`, "right");
          // this.generalservice.nextChatbotReplyToGiver = null;
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `Your entry is invalid! Here are a list of words that could help you quickly navigate the system.
             `,
            `left`,
            "I want to be identified,Stay anonymous",
            "identify,anonymous",
            undefined,
            {classes: ['bot_helper_message']}
          );
          setTimeout(() => {
            this.generalservice.responseDisplayNotifier(response);
          }, 700);
        }
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

  crossCheckUserInputWithRegexes(str) {
    let actualText: string, response: boolean;
    for (const regex of this.arrayOfRegexes) {
      if (regex.test(str)) {
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
