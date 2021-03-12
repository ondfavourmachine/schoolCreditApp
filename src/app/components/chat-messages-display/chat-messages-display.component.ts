import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnChanges,
  Input,
  SimpleChanges,
  OnDestroy,
  Output,
  EventEmitter
} from "@angular/core";
import { Message } from "../../models/message";
import { GeneralService } from "src/app/services/generalService/general.service";
import { ChatService } from "src/app/services/ChatService/chat.service";
import * as generalActions from "../../store/actions/general.action";

// import { TitleCasePipe } from "@angular/common";
import { Subscription } from "rxjs";
import { delay, first, tap } from "rxjs/operators";
import {
  replyGiversOrReceivers,
  GiverResponse,
  ReceiversResponse
} from "src/app/models/GiverResponse";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import { pluck } from "rxjs/operators";
import { SchoolDetailsModel } from "src/app/models/data-models";
import { TitleCasePipe } from "@angular/common";


interface GetBvnResponse {
  text?: string;
  status?: boolean;
}

@Component({
  selector: "app-chat-messages-display",
  templateUrl: "./chat-messages-display.component.html",
  styleUrls: ["./chat-messages-display.component.css"]
})
export class ChatMessagesDisplayComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input("messages") messages: string | Object | GetBvnResponse;
  // @Input('schoolDetails') schoolDetails: Partial<SchoolDetailsModel> = {}
  // lets come back to this input property later!
  @Input("referenceNumberInMsg") referenceNumberInMsg: any;
  @ViewChild("messagesPlaceHolder")
  messagePlaceHolder: ElementRef;
  @Output("restartProcess")
  restartProcess = new EventEmitter<string>();
  @Output("actionDispatched") actionDispatched = new EventEmitter<string>();
  
  // 
   schoolMotto: string;
  // private counter: number;
  private refNo: string;
  private receiverIsPresent: boolean = false;

  obs: MutationObserver;
  private config: MutationObserverInit = {
    attributes: true,
    childList: true,
    subtree: true
  };
  private tokeniseProcess: string;
  public count: number = 0;
  observableToTrash: Subscription[] = [];
  constructor(
    private generalservice: GeneralService,
    private chatservice: ChatService,
    private route: Router,
    private store: Store,
    private titleCase: TitleCasePipe

  ) {
    const stages = generalservice.getStage();
    if (!stages) {
      generalservice.setStage("child-info", []);
      generalservice.setStage("parent-info", {});
      generalservice.setStage("bank-form", {});
      generalservice.setStage("account-info", {});
    }
  }

  ngOnInit() {
    this.observableToTrash[0] = this.generalservice.congratsOrRegrets$.subscribe(
      val => {
        if (val.length < 1) {
          return;
        }
        if (val.toLowerCase() == "cancelled") {
          this.generateFailedRequestMsg(this.messagePlaceHolder.nativeElement);
        } else {
          this.generateSuccessfulSubmissionOfRequestMsg(
            this.messagePlaceHolder.nativeElement
          );
        }
      }
    );

    this.observableToTrash[1] = this.generalservice.intermediateResponse$.subscribe(
      (val: ReceiversResponse | GiverResponse) => {
        // debugger;
        const objCopy: ReceiversResponse & object | GiverResponse & object = {
          ...val
        };
        if (val instanceof ReceiversResponse) {
          if (
            objCopy.hasOwnProperty(
              "messageForUserToDisplayInResponseToPreviousStage"
            )
          ) {
            this.responseFromReceiver(objCopy as ReceiversResponse);
            this.respondToReceiver(
              this.generalservice.nextChatbotReplyToReceiver
            );
          }
          return;
        }
        if (val instanceof replyGiversOrReceivers) {
          this.insertGiversResponseIntoDom(
            val,
            this.generalservice.nextChatbotReplyToGiver
          );
        }
      }
    );

    this.observableToTrash[2] = this.generalservice.preventDisablingOfButtons$.subscribe(
      val => {
        // debugger;
        if (val == "prevent") {
          return;
        } else if ("allow") {
          this.disableTheButtonsOfPreviousListElement();
        }
      }
    );


    

    this.observableToTrash[3] = this.generalservice.nextReply$
      .pipe(delay(500))
      .subscribe(val => {
        let obj = new Object();
        if (!obj.hasOwnProperty("message")) return;
        // console.log(val);
        // this.respondToUsers(val);
      });

      this.observableToTrash[5] = this.store
      .select(fromStore.getCardTokenState)
      .pipe(pluck('state_of_process'))
      .subscribe((val: string )=> {
        this.tokeniseProcess = val;
        if(this.tokeniseProcess == 'not-checking'){
          return;
        }
        if(this.tokeniseProcess == 'checking'){
          this.chatservice.checkIfCardHasBeenAddedByParent().subscribe(
            val => {
                console.log(val);
            },
            err => {

                console.log(val);
                // get the pulsing spinner
                  const pulsingLoader = document.querySelectorAll('.processing_tokenized_card');
                  // console.log(pulsingLoader);
                  // get its parent div
                  const parentElement: HTMLElement = pulsingLoader[pulsingLoader.length - 1].closest('div.chat-box__wrapper');
                  // remove it now
                  this.removeElement(this.messagePlaceHolder.nativeElement, parentElement);
                  this.removeProcessingFromSavedChats();
                  // display this in its place.
                  this.generalservice.nextChatbotReplyToGiver = undefined;
                  this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
                  const chatbotResponse = new replyGiversOrReceivers(
                    `We couldn't confirm your card at this time. Please try again.`,
                      `left`,
                      "Confirm card now,No later", // please these buttons are completely useless and will not be presented in the dom
                      "providedebitcard,nodebitcard",
                       "prevent"
                  );
                  this.generalservice.responseDisplayNotifier(chatbotResponse);
                  this.store.dispatch(new generalActions.checkTokenizeProcess('not-checking'));
            }
          )
          //  new Promise((resolve, reject) => {
          //    setTimeout(() => {
          //      reject({message: 'Card token failed!', status: false})
          //    }, 1500);
          //  }).catch((err) => {
          //   // 
           
          //  })
        }
      });

      this.observableToTrash[6] = this.store.select(fromStore.getLoanApplicationState)
      .pipe(pluck('loan_application_process'))
      .subscribe((val: string) => {
        // console.log(val);
        setTimeout(() => {
         if(val == 'failed'){
            // get the pulsing spinner
          const pulsingLoader = document.querySelectorAll('.truncated_loan_process');
          // console.log(pulsingLoader);
          // get its parent div
          const parentElement: HTMLElement = pulsingLoader[pulsingLoader.length - 1].closest('div.chat-box__wrapper');
          // remove it now
          this.removeElement(this.messagePlaceHolder.nativeElement, parentElement);
          this.removeProcessingFromSavedChats('incomplete loan application');
          // display this in its place.
          this.generalservice.nextChatbotReplyToGiver = undefined;
          this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
          const chatbotResponse = new replyGiversOrReceivers(
            `Your loan application is not complete. Please click the buttons below to continue:`,
              `left`,
              "continue loan application,i am not interested", // please these buttons are completely useless and will not be presented in the dom
              `connectme, notinterested`,
               "prevent"
          );
          this.generalservice.responseDisplayNotifier(chatbotResponse);
          this.store.dispatch(new generalActions.checkTokenizeProcess('not-checking'));
         }
        }, 1500);
      })
      
      this.selectMottoFromSchool();
     
  }

  

  ngOnChanges(messages: SimpleChanges) {
    const msg = { ...messages.messages };
    if (msg.currentValue) {
      // console.log(msg.currentValue);
      this.displaySubsequentMessages({
        message: msg.currentValue.message,
        direction: msg.currentValue.direction,
        button: !msg.currentValue.button ? null : msg.currentValue.button
      });
    }
  }

  ngAfterViewInit(message?: string, direction?: string) {
    // debugger;
    const ul = this.messagePlaceHolder.nativeElement as HTMLUListElement;
    // watch this function below:
    this.generateWelcomeMsgForReceiverOrGiver(ul);

    ul.addEventListener("customReceiverEventFromMsgClass", (e: CustomEvent) => {
      const { stage, message, text } = e.detail;
      // console.log(e.detail);
      if (String(stage).includes("transparency-disclaimer")) {
        this.generalservice.handleFlowController("receiverContainer");
        // this.disableTheButtonsOfPreviousListElement();
      }
      if (String(message).toLowerCase() == "yes, help me") {
        const response: ReceiversResponse = new ReceiversResponse(
          this.generalservice.typeOfPerson,
          "",
          {
            message,
            direction: "right",
            button: "",
            extraInfo: undefined
          },
          new replyGiversOrReceivers(
            "I would like to know if you are in Nigeria. Please turn on your location.",
            "left",
            "i have done so",
            "location on,location off"
          )
        );
        this.generalservice.nextChatbotReplyToReceiver =
          response.optionalReplyToUser;
        this.generalservice.responseDisplayNotifier(response);
      }

      if (String(message).toLowerCase() == "yes, my location is turned on.") {
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.generalservice.getLocationOfUser();
        setTimeout(() => {
          this.manageLocationIssuesScenario(message);
        }, 2000);
      }
      if (String(message).toLowerCase() == "i have turned on my location") {
        const response = new replyGiversOrReceivers(
          `Get the following information ready before we start:
                (1) The Account number you want to get funds into
                (2) A picture with you and your family taken today.
                (3) A valid means of ID (Voters, Drivers licence, National ID),
                `,
          "left",
          "Continue,No I want to help a family",
          "receive,give"
        );
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.displaySubsequentMessages(response);
      }
      if (String(message).toLowerCase() == "continue without it") {
        const userResponse = new replyGiversOrReceivers(
          `${String(message)}`,
          "right"
        );
        const chatBotReply = new replyGiversOrReceivers(
          `Get the following information ready before we start:
            (1) The Account number you want to get funds into
            (2) A picture with you and your family taken today.
            (3) A valid means of ID (Voters, Drivers licence, National ID),
          `,
          "left",
          "Continue,No I want to help a family",
          "receive,give"
        );
        this.displaySubsequentMessages(userResponse);
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        setTimeout(() => {
          this.displaySubsequentMessages(chatBotReply);
        }, 500);
      }
    });
    //   IdentifyOrAnonymousForms
    ul.addEventListener("customGiverEventFromMsgClass", (e: CustomEvent) => {
      // debugger;
      const {
        typeOfEvent,
        message,
        componentToLoad,
        moreInformation,
        callBack
      } = e.detail;
      // debugger;
      if (String(message).includes( 'giver')) {
        sessionStorage.setItem("route", String(message));
        // this.generalservice.receiver = "school";
        // this.route.navigate(["school"]);
      }
      if (String(componentToLoad).toLowerCase() == "child-information-forms") {
        this.generalservice.handleFlowController(String(componentToLoad));
      }


      if (String(componentToLoad).toLowerCase() == "school-books") {
        this.generalservice.handleFlowController(String(componentToLoad));
        this.generalservice.handleSmartViewLoading({
          component: String(componentToLoad),
          info: "schoolBooks"
        });
      }

      if (String(componentToLoad).toLowerCase() == "make-full-payment") {
        this.generalservice.handleFlowController(String(componentToLoad));
      }

      if (String(componentToLoad).toLowerCase() == "edit-parent-info") {
        this.generalservice.handleFlowController(String(componentToLoad));
        // this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      }
      if (String(componentToLoad).toLowerCase() == "supportpageforms") {
        this.generalservice.handleFlowController(String(componentToLoad));
      }

      if (String(componentToLoad).toLowerCase() == "parents-information") {
        this.generalservice.handleFlowController(String(componentToLoad));
      }
      if (String(componentToLoad).toLowerCase() == "parent-account-form") {
        if (callBack && typeof callBack() == "string" && callBack() == "attach-card") {
          this.generalservice.handleSmartViewLoading({
            component: String(componentToLoad),
            info: "attach-card"
          });
          this.generalservice.handleFlowController(String(componentToLoad));
        } else {
          this.generalservice.handleFlowController(String(componentToLoad));
        }
      }
      if (String(componentToLoad).toLowerCase() == "verify-parent-data") {
        this.generalservice.handleFlowController(String(componentToLoad));
      }
      if (
        String(componentToLoad).toLowerCase() == "continuing-existing-requests"
      ) {
        this.generalservice.handleFlowController(String(componentToLoad));
        const res = callBack();
        const stage = this.determineWhatStageToGoNext(res);
        this.generalservice.communicateNextStage(stage);
      }
      if (String(componentToLoad).toLowerCase() == "bank-partnership") {
        let res;
        callBack ? (res = callBack()) : undefined;
        if (res) {
          this.generalservice.handleSmartViewLoading({
            component: "bank-partnership",
            info: res
          });
        }
        this.generalservice.handleFlowController(String(componentToLoad));
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      }
      if (moreInformation) {
        let arrToPush = [];

        arrToPush = JSON.parse(sessionStorage.getItem("evidenceUploadData"));
        if (arrToPush) {
          let temp = moreInformation.split("-");
          let obj = {};
          obj[temp[1]] =
            String(temp[2]) + "/" + String(temp[3]) + "/" + String(temp[4]);
          // arrToPush.push(obj);
          this.generalservice.noOfevidencesOfTransferToUpload.push(obj);
        } else {
          arrToPush = [];
          let temp = moreInformation.split("-");
          let obj = {};
          obj[temp[1]] =
            String(temp[2]) + "/" + String(temp[3]) + "/" + String(temp[4]);
          // arrToPush.push(obj);
          this.generalservice.noOfevidencesOfTransferToUpload.push(obj);
        }

        this.generalservice.handleFlowController("evidenceUploadComponent");
        this.generalservice.uploadEvidenceOfTransferInProgress = true;
      }
    });

    ul.addEventListener("customGiverResponse", (e: CustomEvent) => {
      const { reply, message } = e.detail;

      if (!reply) {
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.displaySubsequentMessages({
          message: message.message,
          direction: message.direction,
          button: message.button,
          extraInfo: message.extraInfo
        });
        // this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
        //   message.preventOrAllow ? message.preventOrAllow : 'prevent'
        // );
        return;
      }
      this.insertGiversResponseIntoDom(reply, message);
    });

    ul.addEventListener("customEventFromMessageClass", (e: CustomEvent) => {
      const { message, callBack } = e.detail;
      if (message == "restart") {
        const string = callBack();
        this[string[0]][string[1]](message);
      }
    });

    setTimeout(() => {
      this.refillChatBotWithChats();
    }, 1000);

    this.obs = new MutationObserver((mutations: MutationRecord[], observer) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const { addedNodes } = mutation;
          const element = addedNodes[0];
          try {
            if (
              (element as HTMLElement).classList &&
              (element as HTMLElement).classList.contains("left")
            ) {
              const textWrapper =
                (element as HTMLElement).firstElementChild.childNodes.length ==
                1
                  ? (element as HTMLElement).firstElementChild.firstElementChild
                  : (element as HTMLElement).firstElementChild.lastElementChild;
              // debugger;
              if (textWrapper.classList.contains("bot_helper_message")) {
                const html = `
                <div class="mutation-inserted__text">
                  Your entry is invalid! <br /> <br /> Here are a list of words that could help you quickly navigate the system.
                   <br />
                   <br />
                   <span class="command">To restart the whole process: enter <strong>'restart'</strong> </span>
                   <hr />
                   <span class="command">To continue from previous stage: enter <strong>'continue previous'</strong></span>
                   <hr />
                   <span class="command">To register a child or children: enter <strong>'register child'</strong></span>
                   <hr />
                   <span class="command">To enter your account details: enter <strong>'register account details'</strong></span>
                 </div>
                  `;
                textWrapper.innerHTML = "";
                textWrapper.insertAdjacentHTML("afterbegin", html);
              }

               if(textWrapper.classList.contains('processing_tokenized_card')){
                const html = `
                <div class="mutation-inserted__text processing_div" style="height: 22px;">
                    <div class="row">
                    <div class="col-3">
                    <div  data-title=".dot-pulse">
                      <div class="stage" style="display: flex;justify-content: center;align-items: center; height: 20px;">
                        <div class="dot-pulse"></div>
                      </div>
                    </div>
                  </div>
                    </div>
                 </div>
                  `;
                  textWrapper.innerHTML = "";
                textWrapper.insertAdjacentHTML("afterbegin", html);
               }
               if(textWrapper.classList.contains('truncated_loan_process')){
                const html = `
                <div class="mutation-inserted__text processing_div" style="height: 22px;">
                    <div class="row">
                    <div class="col-3">
                    <div  data-title=".dot-pulse">
                      <div class="stage" style="display: flex;justify-content: center;align-items: center; height: 20px;">
                        <div class="dot-pulse"></div>
                      </div>
                    </div>
                  </div>
                    </div>
                 </div>
                  `;
                  textWrapper.innerHTML = "";
                textWrapper.insertAdjacentHTML("afterbegin", html);
               }
              
              else if (textWrapper.classList.contains("helper")) {
                const html = `
                <div class="mutation-inserted__text">
                  Hi, you asked for help!<br /> <br /> Here are a list of words that could help you quickly navigate the system.
                   <br />
                   <br />
                   <span class="command">To restart the whole process: enter <strong>'restart'</strong> </span>
                   <hr />
                   <span class="command">To continue from previous stage: enter <strong>'continue previous'</strong></span>
                   <hr />
                   <span class="command">To register a child or children: enter <strong>'register child'</strong></span>
                   <hr />
                   <span class="command">To enter your account details: enter <strong>'register account details'</strong></span>
                 </div>
                  `;
                textWrapper.innerHTML = "";
                textWrapper.insertAdjacentHTML("afterbegin", html);
              }
            }
          } catch (error) {
            return;
          }
        }
        // else if (mutation.type === 'attributes') {
        //     console.log('The ' + mutation.attributeName + ' attribute was modified.');
        // }
      }
    });

    // Start observing the target node for configured mutations
    this.obs.observe(ul, this.config);

    this.observableToTrash[4] = this.generalservice.reset$.subscribe(
      (val: string) => {
        if (val.length < 1) return;
        // const currentRoute = this.route.url;
        sessionStorage.removeItem('savedChats');
        ul.innerHTML = "";
        this.generateWelcomeMsgForReceiverOrGiver(ul);
        // debugger;
        // if (currentRoute.includes("giver")) {
        //   this.route.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        //     this.route.navigate([currentRoute]);
        //   });
        // } else {
        //   this.route
        //     .navigateByUrl("/giver", { skipLocationChange: true })
        //     .then(() => {
        //       this.route.navigate([currentRoute]);
        //     });
        // }

        // this.ngOnInit();
      }
    );
  }

selectMottoFromSchool(){
    this.store.select(fromStore.getSchoolDetailsState)
    .pipe(first(val => this.schoolMotto = val['school_Info'].motto))
    .subscribe();
  }

  removeElement(parent: HTMLElement, child: HTMLElement){
    parent.removeChild(child)
  }

  removeProcessingFromSavedChats(typeOfChatToRemove?: string){
    const savedChats: Array<Message> = JSON.parse(
      sessionStorage.getItem("savedChats")
    );
    let number = undefined;
    switch(typeOfChatToRemove){
      case 'incomplete loan application':
        number = savedChats.findIndex(element => /process your loan application/gi.test(element.text));
        savedChats.splice(number, 1);
        sessionStorage.setItem('savedChats', JSON.stringify(savedChats));
     
      break;
      default:
        number = savedChats.findIndex(element => /process your card details/gi.test(element.text));
        savedChats.splice(number, 1);
        sessionStorage.setItem('savedChats', JSON.stringify(savedChats));
      break;
    }
    
  }


  refillChatBotWithChats() {
    const savedChats: Array<Message> = JSON.parse(
      sessionStorage.getItem("savedChats")
    );
    if (!savedChats) return;
    if (savedChats.length == 3) return;
    const remainingChats = savedChats.slice(3);
    this.generalservice.nextChatbotReplyToGiver = undefined;
    remainingChats.forEach((element, index, array) => {
      this.insertGiversResponseIntoDom(
        new replyGiversOrReceivers(
          element.text,
          element.direction,
          element.buttonElement,
          element.extraInfo,
          index == array.length - 1 ? "prevent" : "allow"
        ),
        undefined
      );
    });
  }

  // covid relief bot replies to givers
  respondToUsers(reply: replyGiversOrReceivers) {
    this.displaySubsequentMessages({
      message: reply.message,
      direction: reply.direction,
      button: reply.button,
      extraInfo: reply.extraInfo
    });
  }

  // A funtion to control  Givers Response to chatbot questions and also respond accordingly;
  // so sometimes there would be a reply.reply and at other times there would not
  // when there is not. The try will run run successfully. Else the catch will run.
  insertGiversResponseIntoDom(
    reply: replyGiversOrReceivers,
    chatbotReply?: replyGiversOrReceivers
  ) {
 
    try {
      const { message, direction, options } = reply["reply"];
      // console.dir(options);
      this.displaySubsequentMessages({
        message: message,
        direction: direction,

      });
      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      setTimeout(() => {
        this.displaySubsequentMessages(chatbotReply);
      }, 1000);
    } catch (e) {
      const { message, direction, preventOrAllow, options } = reply;
      // console.dir(options);
      this.displaySubsequentMessages({
        message: message,
        direction: direction,
        button: reply.button ? reply.button : "",
        extraInfo: reply.extraInfo ? reply.extraInfo : "",
        options
      });
      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
        preventOrAllow ? preventOrAllow : "allow"
      );

      setTimeout(() => {
        this.displaySubsequentMessages(chatbotReply);

        if (
          chatbotReply &&
          /upload/i.test(chatbotReply.button) &&
          this.route.url.includes("giver")
        ) {
          this.generalservice.reEnableUploadButton();
        }
      }, 700);
    }
  }

  respondToReceiver(reply: replyGiversOrReceivers) {
    setTimeout(() => {
      this.displaySubsequentMessages({
        message: reply.message,
        direction: reply.direction,
        button: reply.button,
        extraInfo: reply.extraInfo
      });
    }, 500);
  }

  responseFromReceiver(obj: ReceiversResponse) {
    if (typeof obj.messageForUserToDisplayInResponseToPreviousStage) {
      this.displaySubsequentMessages({
        message: obj.messageForUserToDisplayInResponseToPreviousStage.message,
        direction:
          obj.messageForUserToDisplayInResponseToPreviousStage.direction
      });
    }
  }

  displaySubsequentMessages(obj: {
    message: string;
    direction: string;
    button?: string;
    extraInfo?: string;
    preventOrAllow?: string;
    options?: { classes: string[] };
  }) {
    
    let ul: HTMLUListElement;
    // back up plan if the above doesnt work;
    if (this.messagePlaceHolder) {
      ul = this.messagePlaceHolder.nativeElement as HTMLUListElement;
    } else {
      ul = document.getElementById("messagesPlaceHolder") as HTMLUListElement;
    }
    try {
      if (obj == null) return;
      if (!obj.button) {
        const messageToDisplay = new Message(
          `${obj.message ? obj.message : " "}`,
          `${obj.direction ? obj.direction : "left"}`,
          ul
        );
        //  incrementing this is important
        this.count++;
        messageToDisplay.makeAndInsertMessage(this.count);
      } else {
        this.count++;
        const messageToDisplay = new Message(
          `${obj.message ? obj.message : " "}`,
          `${obj.direction ? obj.direction : "left"}`,
          ul,
          obj.button,
          obj.extraInfo,
          obj.options
        );
        // if(obj.hasOwnProperty('options')) console.dir(obj.options);
        messageToDisplay.makeAndInsertMessage(this.count);
        // console.log(this.count);
      }
    } catch (err) {}
  }

  // changes the title of Modal for the different forms
  changeModalTitle(str: string) {
    this.generalservice.nameOfModal = str;
  }

  handleBVNAndDOBError(err: any) {
    if (err.status == 500) {
      this.displaySubsequentMessages({
        message: Message.displayMsgWhenThereIsServerError(),
        direction: "left"
      });
    }
  }

  requestRef(ref: string) {
    setTimeout(() => {
      if (!ref) {
        this.displaySubsequentMessages({
          message: "Is this your first time giving here for COVID Relief",
          direction: "left",
          button: "Yes, No",
          extraInfo: "startGiving, notInterested"
        });
        this.actionDispatched.emit("refChecking");
      } else {
        // this.checkForRefNoAndDisplayAppropriateMsg(ref);
      }
    }, 300);
  }

  // disable buttons in previous elements
  disableTheButtonsOfPreviousListElement() {
    //  document.querySelector("ul > li:last-child");
    // debugger;
    try {
      const buttonContainer = document.querySelector(".button-container");
      if (buttonContainer.classList.contains("right")) {
        const buttons: NodeListOf<
          HTMLButtonElement
        > = buttonContainer.previousElementSibling.querySelectorAll(
          ".dynamicButton"
        );
        buttons.forEach(button => {
          button.classList.add("disabled");
          button.disabled = true;
        });
      }
    } catch (e) {
      console.log(e);
    }
    try {
      let nl: NodeList = document.querySelectorAll(".button-container");
      const buttons = (nl[nl.length - 1] as HTMLButtonElement).querySelectorAll(
        ".dynamicButton"
      );
      if (buttons.length > 0) {
        let button: HTMLButtonElement;
        for (let i = 0; i < buttons.length; i++) {
          button = buttons[i] as HTMLButtonElement;
          if (
            buttons[i].classList.contains("dynamicButton") &&
            !button.disabled
          ) {
            // remember to add a disabled class here, after you have disabled it
            // so that it can appear disabled
            button.classList.add("disabled");
            button.disabled = true;
            // removes the button from the dom;
            button.style.pointerEvents = "none";
          } else {
            continue;
          }
        }
      }
    } catch (e) {}
  }

  userDidNotProvideDriversLicense() {
    this.displaySubsequentMessages({
      message: "No, i do not have a drivers license.",
      direction: "right"
    });

    setTimeout(() => {
      this.displaySubsequentMessages({
        message: "Ok, when you are ready, Let us now play a 120 secs game",
        direction: "left",
        button: "Play, Pause"
      });
    }, 1000);
  }

  getQuestions() {
    const questions = sessionStorage.getItem("questions");
    // console.log(questions);
    if (!questions) {
      let ref_no = sessionStorage.getItem("ref_no");
      this.chatservice.getCredibiltyQuestions(ref_no).subscribe(val => {
        sessionStorage.setItem("questions", JSON.stringify(val.text));
      });
    }
  }

  welcomeMsgCtrl(str: string) {
    this.generalservice.typeOfPerson = "";
    let regex = /receiver/;
    if (regex.test(str)) {
      this.receiverIsPresent = true;
      this.generalservice.typeOfPerson = str;
    } else {
      this.generalservice.typeOfPerson = str;
      this.receiverIsPresent = false;
    }
  }

   generateWelcomeMsgForReceiverOrGiver(
    ul: HTMLUListElement,
    giverOrReceiver?: string,
    schoolDetails?: Partial<SchoolDetailsModel>
  ) {
    // console.log(this.receiverIsPresent);
    setTimeout(() => {
        const msgs = Message.welcomeMessagesForGiver;
        let newString = '';
        const userNameOfSchool = this.route.url.split('/').length > 2 ?  this.route.url.split('/').slice(-1)[0] : undefined
        let messageToDisplay: Message;
        this.count = 0;
        
        msgs.forEach((msg, index) => {
          if (index == 2) {
            this.count = index;
         
            // Continue existing request
            messageToDisplay = new Message(
              `${msg}`,
              `left`,
              ul,
              "New request, continue an existing request",
              "newRequest,continuingRequest"
            );
            messageToDisplay.makeAndInsertMessage(this.count);
            return;
          }
          
          newString = msg.replace('Adama', userNameOfSchool ? this.titleCase.transform(userNameOfSchool) : 'Adanma'); 
          newString = newString.split('?')[0];
          newString+=  this.modifyMotto();
          messageToDisplay = new Message(`${newString ? newString : 'Adama'}`, `left`, ul);
          messageToDisplay.makeAndInsertMessage(index);
        });
    
    }, 1000);
  }

  modifyMotto(): string{
    return this.schoolMotto ? ` ${this.schoolMotto}.` : ' The Citadel of excellence.'
  }

  generateSuccessfulSubmissionOfRequestMsg(ul: HTMLUListElement) {
    const msgs = Message.successfulRequestsMade;
    let messageToDisplay: Message;
    msgs.forEach((msg, index) => {
      messageToDisplay = new Message(`${msg}`, `left`, ul);
      messageToDisplay.makeAndInsertMessage(2);
    });
  }

  generateFailedRequestMsg(ul: HTMLUListElement) {
    const msgs = Message.failedRequests;
    let messageToDisplay: Message;
    msgs.forEach((msg, index) => {
      messageToDisplay = new Message(`${msg}`, `left`, ul);
      messageToDisplay.makeAndInsertMessage(2);
    });
  }

  manageLocationIssuesScenario(message) {
    const userLatLng = JSON.parse(sessionStorage.getItem("userLatLng"));
    // this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    const nl: NodeList = document.querySelectorAll(".dynamicButton");
    this.generalservice.specialCaseButtons(nl);
    try {
      if (userLatLng["latitude"]) {
        const response: ReceiversResponse = new ReceiversResponse(
          this.generalservice.typeOfPerson,
          "",
          {
            message,
            direction: "right",
            button: "",
            extraInfo: undefined
          },
          new replyGiversOrReceivers(
            `Get the following information ready before we start:
            (1) The Account number you want to get funds into
            (2) A picture with you and your family taken today.
            (3) A valid means of ID (Voters, Drivers licence, National ID),
            `,
            "left",
            "Continue,No I want to help a family",
            "receive,give"
          )
        );
        this.generalservice.nextChatbotReplyToReceiver =
          response.optionalReplyToUser;
        // this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.generalservice.responseDisplayNotifier(response);
      }
    } catch (err) {
      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      const response = new replyGiversOrReceivers(
        `i am still not able to get your location. It might affect your chances of getting help.`,
        "left",
        "i have turned it on,continue without it",
        "location now on,forget about it"
      );
      this.displaySubsequentMessages({
        message: response.message,
        direction: response.direction,
        button: response.button,
        extraInfo: response.extraInfo
      });
      // this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      // this.generalservice.responseDisplayNotifier(response);
    }
  }

  determineWhatStageToGoNext(res: boolean): string {
    if (res) {
      const stages = this.generalservice.getStage();
      let stageToStartFrom: string;
      const arrayOfStages = [];
      for (let stage in stages) {
        if (stage == "child-info") {
          arrayOfStages[1] = stage;
        }
        if (stage == "bank-form" && Object.keys(stages[stage]).length < 1) {
          arrayOfStages[2] = stage;
        }
        if (stage == "account-info") {
          arrayOfStages[3] = stage;
        }
        if (stage == "parent-info") {
          arrayOfStages[0] = stage;
        }
      }

      for (let i = 0; i < arrayOfStages.length; i++) {
        if (arrayOfStages[i] == "parent-info") {
          const stage = arrayOfStages[i];
          stageToStartFrom = stage;
          return stageToStartFrom;
        }
        if (arrayOfStages[i] == "child-info") {
          const stage = arrayOfStages[i];
          (stages[stage] as Array<any>).length < 1
            ? (stageToStartFrom = "child-info")
            : null;
        } else {
          const stage = arrayOfStages[i];
          if (Object.keys(stages[stage]).length < 1) {
            stageToStartFrom = stage;
          }
        }
      }
      return stageToStartFrom;
    }
  }

  ngOnDestroy() {
    this.observableToTrash.forEach(element => element.unsubscribe());
  }
}
