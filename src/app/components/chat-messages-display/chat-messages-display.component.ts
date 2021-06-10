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
import { of, Subscription } from "rxjs";
import {  delay,  first, takeLast, takeWhile } from "rxjs/operators";
import {
  replyGiversOrReceivers,
  GiverResponse,
  ReceiversResponse
} from "src/app/models/GiverResponse";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import { pluck } from "rxjs/operators";
import { AChild, Parent, SchoolClass, SchoolDetailsModel, TeacherDetails } from "src/app/models/data-models";
import { TitleCasePipe } from "@angular/common";
import { ChildrenState } from "src/app/store/reducers/children.reducer";


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
  // properties for questions
  // begins here
  addressForQuestionnaire: string;
  questionsToAsk: Map<string, Record<string, any>> = new Map();
  currentQuestion: {[k: string]: string | any} = {};
  answeredQuestions: Array<Record<string, string>>= [];
  iterator: Iterator<any>;
  iteratorForKeys: Iterator<any>;
  answerFromUser: Array<Record<string, string>> = [];
  collectedAnswer: Map<string, Record<string, any>> = new Map();
  stringIndexOfCurrentQuestion: string;

  //ends here
  
  constructor(
    private generalservice: GeneralService,
    private chatservice: ChatService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store,
    private titleCase: TitleCasePipe

  ) {
    this.handleAnswerClick = this.handleAnswerClick.bind(this);
    // initialize questions in constructor
    this.questionsToAsk.set('first', {question: 'Do you know Bukunmi?', answers: ['Yes', 'No']});
    this.questionsToAsk.set('second', {question: `Does he/She stay at ${this.addressForQuestionnaire}?`, answers: ['Yes', 'No']});
    this.questionsToAsk.set('third', {question: 'Is your relationship with him or her that of Family or Colleague ?', answers:['Yes','No']});
    this.questionsToAsk.set('Fourth', {question: 'have you known him for more than 1 year?', answers: ['Yes', 'No']});
    this.iterator = this.questionsToAsk.values();
    this.iteratorForKeys = this.questionsToAsk.keys();
    // this.currentQuestion = this.iterator.next().value;
    
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

      this.observableToTrash[4] = this.store
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
                // console.log(val);
            },
            err => {

                // console.log(val);
                // get the pulsing spinner
                  const pulsingLoader = document.querySelectorAll('.processing_tokenized_card');
                  // console.log(pulsingLoader);
                  // get its parent div
                  const parentElement: HTMLElement = pulsingLoader[pulsingLoader.length - 1].closest('div.chat-box__wrapper') as HTMLElement;
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

      this.observableToTrash[5] = this.store.select(fromStore.getLoanApplicationState)
      .pipe(pluck('loan_application_process'))
      .subscribe((val: string) => {
        // console.log(val);
        setTimeout(() => {
         if(val == 'failed'){
          const pulsingLoader = document.querySelectorAll('.truncated_loan_process');
          // console.log(pulsingLoader);
          // get its parent div
          const parentElement: HTMLElement = pulsingLoader[pulsingLoader.length - 1].closest('div.chat-box__wrapper') as HTMLElement;
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
      // this.chatservice.deleteGuardian().then();

      this.observableToTrash[10] = this.generalservice.answersToQuestions$.subscribe(
        val => {
          if(!this.stringIndexOfCurrentQuestion){
            return;
          }
          this.displaySubsequentMessages({
            message: (val as string),
            direction: 'right'
          })
          const theanswerArray : Array<string> = this.questionsToAsk.get(this.stringIndexOfCurrentQuestion).answers;
          const isInthere = theanswerArray.some((item) => item.trim().toLowerCase() == (val as string).trim().toLowerCase() );
          const reducedAnswer = theanswerArray.reduce((acc, elem, index, arr) => {
            index == arr.length - 1 ?  acc+= ` or ${elem}` : acc+=`${elem},`;
            return acc;
          }, '')
          if(!isInthere) { 
            this.displaySubsequentMessages({
              message: `You entered a wrong answer. Please enter ${reducedAnswer} as your answer`,
              direction: 'left'
            })
          }
          else{
            const found = theanswerArray.find(elem => elem.trim().toLowerCase() == (val as string).trim().toLowerCase());
            if(found){
              this.arrangeAnswersAndQuestions(found);
              this.getNextQuestion();
              return;
            }
            // this is not needed actually just incase the first check fails. I should remove it later!
            this.displaySubsequentMessages({
              message: `You entered a wrong answer. Please enter ${reducedAnswer} as your answer.`,
              direction: 'left'
            })
          }
        }
      )
     
  }


  getNextQuestion(){
   // check if the user answered he doesnt know this person then return immediately;
   if(this.stringIndexOfCurrentQuestion == 'first'){
    const questionAndAnswer = this.collectedAnswer.get('first');
    if((questionAndAnswer as Array<any>)[0].useranswer == 'No'){
      const answers = [this.collectedAnswer.get('first')[0].useranswer]
      this.sendQuestionsAndAnswersToServer(answers);
      this.generalservice.notifyThatQuestionsHasStartedOrEnded(false);
      return;
    }
   }
      
    try {
    this.stringIndexOfCurrentQuestion = this.iteratorForKeys.next().value;
    if(!this.stringIndexOfCurrentQuestion){
      throw 'Questions have finished';
    }
    this.currentQuestion = this.iterator.next().value;
    this.insertQuestionsIntoDOM(); 
    } catch (error) {
      // console.log(error);
      this.generalservice.notifyThatQuestionsHasStartedOrEnded(false);
      const arrayofQuestionAndAnswers = Array.from((this.collectedAnswer.values())).map( elem => elem[0].useranswer);
      this.sendQuestionsAndAnswersToServer(arrayofQuestionAndAnswers)
    }
    
  }


  arrangeAnswersAndQuestions(answerIndex: number | string){
    const whole = this.questionsToAsk.get(this.stringIndexOfCurrentQuestion);
    const question = whole.question;
    const text = typeof answerIndex == 'number' ? whole.answers[answerIndex - 1] : answerIndex;
    this.answerFromUser.push({question: question, useranswer: text });
    this.collectedAnswer.set(this.stringIndexOfCurrentQuestion, this.answerFromUser);
    this.answerFromUser = [];
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

  ngAfterViewInit() {
    const ul = this.messagePlaceHolder.nativeElement as HTMLUListElement;
    let dataToUse: string, userID: string
    this.activatedRoute.queryParams.subscribe(
      val => {
        const {comp} = val;
        if(comp){ dataToUse = comp; userID = val['id']}
      }
    )
    const onboard = this.activatedRoute.snapshot.url[0].path;
   
    // this.insertProcessingBeforeSchoolDetailsLoad(ul);
    // watch this function below:
  
    const runWelcome =  () => {
      this.insertProcessingBeforeSchoolDetailsLoad(ul);
     this.store.select(fromStore.getSchoolDetailsState) 
      .pipe(
         takeWhile((val) => {
           return val['school_Info_Load_state'] != 'completed'
         }),
         takeLast(1),
         pluck('school_Info')
         ).subscribe(
          val => {
            const urlArray = this.route.url.split('/');
            // run a function here that will take generateWelcomeMsg as callback;
          
            urlArray[urlArray.length - 1].includes('teacher') ? this.generateWelcomeMsgForTeacher(ul, val as SchoolDetailsModel) : this.generateWelcomeMsgForReceiverOrGiver(ul, undefined, val as SchoolDetailsModel);
          },
          err => {
            this.generateWelcomeMsgForReceiverOrGiver(ul, undefined, undefined);
          }
      )
    } 
    if(dataToUse){
      this.generateQuestionWelcomeMsg(ul, userID);
    }
    if(onboard){
      this.generateWelcomeMsgForOnboardingAgent(ul);
    }
    else{
      runWelcome();
    }
    

    

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
      }
      if (String(componentToLoad).toLowerCase() == "child-information-forms") {
        this.generalservice.handleFlowController(String(componentToLoad));
      }

      if (String(componentToLoad).toLowerCase() == "agent-profile") {
        this.generalservice.handleFlowController(String(componentToLoad));
      }
      

      if(String(componentToLoad).toLowerCase() == 'teacher-loan-application'){
        this.generalservice.handleFlowController(String(componentToLoad));
      }


      if (String(componentToLoad).toLowerCase() == "school-books") {
        this.generalservice.handleFlowController(String(componentToLoad));
        this.generalservice.handleSmartViewLoading({
          component: String(componentToLoad),
          info: "schoolBooks"
        });
      }

      if(String(componentToLoad).toLowerCase() == "questions-component"){
        this.generalservice.handleFlowController(String(componentToLoad));
      }

      if (String(componentToLoad).toLowerCase() == "make-full-payment") {
        this.generalservice.handleFlowController(String(componentToLoad));
      }

      if(String(componentToLoad).toLowerCase() == 'edit-child-information'){
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
        if(callBack) {
          const res = callBack();
          if(res.trim() == 'parent-is-editing'){
            this.store.dispatch(new generalActions.editParentInfo(true))
          }
          this.generalservice.handleFlowController(String(componentToLoad));
          return;
        }
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
        if(typeof res == 'boolean'){
          const stage = this.determineWhatStageToGoNext(res);
          this.generalservice.communicateNextStage(stage);
        }else{
          this[res[0]][res[1]]('reset');
        }
        
      }
      if (String(componentToLoad).toLowerCase() == "bank-partnership") {
        let res;
        callBack ? (res = callBack()) : undefined;
        // console.log(res);
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
      const { reply, message, callBack } = e.detail;

      if(callBack instanceof Function){
        const nameOfFunctionHere = callBack()[0];
        // console.log(nameOfFunctionHere);
          this[nameOfFunctionHere]();
      }

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


    ul.addEventListener('customEventsForQuestions', (e: CustomEvent) => {
      const {message} =  e.detail;
      console.log(message);
      this[message]();
    })

    this.obs = new MutationObserver(async (mutations: MutationRecord[], observer) => {
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
                //  console.log(textWrapper);
              if (textWrapper.classList.contains("bot_helper_message")) {
                const html = `
                <div class="mutation-inserted__text">
                  Your entry is invalid! <br /> <br /> Here are a list of words that could help you quickly navigate the system.
                   <br />
                   <br />
                   <span class="command">To restart the whole process: enter <strong>'restart'</strong> </span>
                   <hr /> 
                   <span class="command">To start a new registration: enter: 
                   <strong>'start'</strong>,<strong>'restart'</strong>, <strong>'register'</strong>, <strong>'begin'</strong>, <strong>'go'</strong> </span>
                   <hr />
                   <span class="command">To continue from previous stage: enter <strong>'continue previous'</strong></span>
                   <hr />
                   <span class="command">To register a child or children: enter <strong>'register child'</strong></span>
                 
                 </div>
                  `;
                textWrapper.innerHTML = "";
                textWrapper.insertAdjacentHTML("afterbegin", html);
                }

               if(textWrapper.classList.contains('processing_tokenized_card')){
                //  console.log('i am here')
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
                
               if(textWrapper.classList.contains('changing_to_installmental')){
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
                this.manageChangeToInstallmentalPayments()
               }

               if(textWrapper.classList.contains('harmonize_children_information')){
                 const mediaQuery = window.matchMedia("(max-width: 500px)");
                 if(mediaQuery.matches){
                  const html = await this.arrangeSummaryFromChildDetailsForSmallScreen(textWrapper as HTMLElement);
                  textWrapper.innerHTML = '';
                  textWrapper.insertAdjacentHTML('afterbegin', html as string);
                  return;
                 }
                 const html = await this.arrangeSummaryFromChildDetailsSubmissionForWideScreen(textWrapper as HTMLElement);
                 textWrapper.innerHTML = '';
                 textWrapper.insertAdjacentHTML('afterbegin', (html as HTMLElement).outerHTML);
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

    this.observableToTrash[6] = this.generalservice.reset$.subscribe(
      (val: string) => {
        if (val.length < 1) return;
        sessionStorage.removeItem('savedChats');
        ul.innerHTML = "";
        this.generateWelcomeMsgForReceiverOrGiver(ul);
        sessionStorage.removeItem('editChild');
        sessionStorage.removeItem('listOfChildren');
        // sessionStorage.removeItem(\)
        this.store.dispatch(new generalActions.editParentInfo(false))
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
    const waitForWelcomeMessages = async (): Promise<boolean> => {
      return new Promise((resolve, reject)=> {
          new MutationObserver((mutations: MutationRecord[], observer) => {
           const buttons =  document.querySelectorAll('.dynamicButton');
           if(buttons.length > 0){
             resolve(true);
             observer.disconnect();
           }
          }).observe(document.documentElement, {
              childList: true,
             subtree: true,
          })
      })
    }

    waitForWelcomeMessages()
    .then(val => {
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
    })

   
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
      if(!buttonContainer) return;
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

  generateWelcomeMsgForTeacher
  (ul: HTMLUListElement, schoolDetails: Partial<SchoolDetailsModel>)
  {
    this.store.select(fromStore.teacherDetailsState)
    .pipe(
      takeWhile(
        val => val['teacher_Info_Load_state']  != 'loading'
        ),
      pluck('teacher_Info')
    )
    .subscribe(
      (val: TeacherDetails) => {
        const preLoader = document.querySelector('.pre_loader');
        preLoader ? ul.removeChild(preLoader): null;
        const msgs = Message.welcomeMessagesForTeacher;
        let userNameOfSchool = schoolDetails ? schoolDetails.name : this.route.url.split('/').slice(-1)[0];
        msgs[0] = `Welcome, ${val.name}. ${userNameOfSchool} has added you as a staff in their platform.,`
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
              "Yes, No",
              "interestedinloan,notinterestedinloan"
            );
            messageToDisplay.makeAndInsertMessage(this.count);
            return;
          }
          messageToDisplay = new Message(msg, 'left', ul);
          messageToDisplay.makeAndInsertMessage(index);
        });
      }
    )
  }

  

  generateWelcomeMsgForOnboardingAgent(ul: HTMLUListElement){
    setTimeout(() => {
      const preLoader = document.querySelector('.pre_loader');
      preLoader ? ul.removeChild(preLoader): null;
      const msgs = Message.welcomeMessagesForAgents;
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
            "Continue, not interested",
            "profileagent,endofonboarding"
          );
          messageToDisplay.makeAndInsertMessage(this.count);
          return;
        }
       
        messageToDisplay = new Message(msg, 'left', ul);
        messageToDisplay.makeAndInsertMessage(index);
      });
  
  }, 500);
  }


   generateWelcomeMsgForReceiverOrGiver(
    ul: HTMLUListElement,
    giverOrReceiver?: string,
    schoolDetails?: Partial<SchoolDetailsModel>
  ) {
    
    setTimeout(() => {
        const preLoader = document.querySelector('.pre_loader');
        preLoader ? ul.removeChild(preLoader): null;
        const msgs = Message.welcomeMessagesForGiver;
        let newString = '';
        let userNameOfSchool = schoolDetails ? schoolDetails.name : this.route.url.split('/').slice(-1)[0];
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
          //  /[&\/\\#,+()$~%.'":*?<>{}]/g
          const arr = userNameOfSchool.split('%20');
          userNameOfSchool = arr.join(' ');
          newString = msg.replace('Adama', userNameOfSchool ? this.titleCase.transform(userNameOfSchool) : 'Adanma'); 
          newString = newString.split('?')[0];
          newString+=  this.modifyMotto(index);
          messageToDisplay = new Message(`${newString ? newString : 'Adama'}`, `left`, ul);
          messageToDisplay.makeAndInsertMessage(index);
        });
    
    }, 1000);
  }

  async generateQuestionWelcomeMsg(ul: HTMLUListElement, id: any) {
    const msgs = Message.questionWelcomeMsgs;
    let messageToDisplay: Message;
    const res = await this.handleUserIdForQuestions(id, ul);
    const name = res.data.legal_name;
    this.addressForQuestionnaire = res.data.address
    const preLoader = document.querySelector('.pre_loader');
    preLoader ? ul.removeChild(preLoader): null;
    msgs.forEach((msg, index) => {
      if(index == 2){
        this.count = index;
        messageToDisplay = new Message(`${msg}`, `left`, ul, 'Yes answer questions,No not interested', 'yesgoahead,goandhugtransformer');
        messageToDisplay.makeAndInsertMessage(this.count);
        return;
      }
      messageToDisplay = new Message(`${index == 1 ? name + ' ' + msg: msg}`, `left`, ul);
      messageToDisplay.makeAndInsertMessage(index);
    });

    // Since name is now available replace bukunmi with name from server;
    this.questionsToAsk.set('first', {question: `Do you know ${name}?`, answers: ['Yes', 'No']})
    this.questionsToAsk.set('second', {question: `Does he/She stay at ${this.addressForQuestionnaire}?`, answers: ['Yes', 'No']});
  }

  
  modifyMotto(number: number): string{
    if(number == 0 && this.schoolMotto){
      return ``;
    }
    else if(!this.schoolMotto) return '';
    else{
      return '';
    }
    
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

  manageChangeToInstallmentalPayments(){
    let parent: Parent;
    const disconnect =  this.store
    .select(fromStore.getCurrentParentInfo)
    .subscribe(val => {
      parent = val as Parent;
    });
    this.chatservice.registerParentForFullPayment({guardian_id: parent.guardian, payment_type : 1})
    .then(
      val => {
        // send for loan request using child data;
        // send for offers
        // get widget stages
        // update the store
        const pulsingLoader = document.querySelectorAll('.changing_to_installmental');
        const parentElement: HTMLElement = pulsingLoader[pulsingLoader.length - 1].closest('div.chat-box__wrapper') as HTMLElement;
        this.removeElement(this.messagePlaceHolder.nativeElement, parentElement);
        this.removeProcessingFromSavedChats('we change your request to installmental');
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        const chatbotResponse = new replyGiversOrReceivers(
          `You can now pay in installments. This is a credit request and a financial institution would like to power your request. 
           Would you like to be connected to one?`,
            `left`,
            "Yes,No", 
            `connectme, notinterested`,
             "prevent"
        );
        this.generalservice.responseDisplayNotifier(chatbotResponse);
        disconnect.unsubscribe();
      }
    ).catch(
      err => {
        const pulsingLoader = document.querySelectorAll('.changing_to_installmental');
        const parentElement: HTMLElement = pulsingLoader[pulsingLoader.length - 1].closest('div.chat-box__wrapper') as HTMLElement;
        this.removeElement(this.messagePlaceHolder.nativeElement, parentElement);
        this.removeProcessingFromSavedChats('we change your request to installmental');
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        const chatbotResponse = new replyGiversOrReceivers(
          `Sorry we couldn't process your request at this time?`,
            `left`,
            "paymenttypetoinstallments,forget about it", 
            `connectme, notinterested`,
             "prevent"
        );
        this.generalservice.responseDisplayNotifier(chatbotResponse);

      }
    )
  }

  async notifyBackendOfLoanRequest(){
    let childArray:Array<Partial<AChild>>, parent: Parent, tuitionFeesTotal: number;
    // get child
    this.observableToTrash[7] = this.store
      .select(fromStore.getCurrentChildState)
      .pipe(pluck("child_info"))
      .subscribe(val => {
       childArray = Array.from((val as Map<string, Partial<AChild>>).values())});
      const arrayOfChildId: {id: any, tuition: string}[] = childArray.map(element => {
        return{
          id: element.child_id || element.id,
          tuition: element.tuition_fees || element.tuition,
          uniform: element.hasOwnProperty('uniform') ? element.uniform : null,
          transport: element.hasOwnProperty('transport') ? element.transport : null,
          feeding: element.hasOwnProperty('feeding') ? element.feeding : null
        }
      })
      // get parent
      this.observableToTrash[8] =  this.store
    .select(fromStore.getCurrentParentInfo)
    .subscribe(val => {
      parent = val as Parent;
    });

    // get tuition
    this.observableToTrash[9] = this.store
      .select(fromStore.getCurrentChildState)
      .subscribe((val: any) => {
        const { total_tuition_fees } = val as ChildrenState;
        tuitionFeesTotal = total_tuition_fees;
      });

      const rf = sessionStorage.getItem('repaymentFrequency');
      const res = await this.chatservice.sendLoanRequest({
      school_id: parent.school_id || 1,
      guardian_id: parent.guardian,
      loan_amount: tuitionFeesTotal.toString(),
      child_data: arrayOfChildId,
      repayment_frequency : rf == 'null' ? '3' : rf
    });
    const updatedParents: Partial<Parent> = {...parent, loan_request: res.request}
    this.store.dispatch(new generalActions.addParents(updatedParents));
    await this.chatservice.fetchWidgetStages(tuitionFeesTotal.toString());
  }


  arrangeSummaryFromChildDetailsForSmallScreen(htmlelement: HTMLElement){
    return new Promise((resolve, reject)=> {
      let arrayOfChildren: Partial<AChild>[] = [];
      const button = htmlelement.querySelector('.button-container').firstChild;
      const schoolClasses: SchoolClass[] = JSON.parse(sessionStorage.getItem('school_classes'));
      const savedChats: Array<Message> = JSON.parse(sessionStorage.getItem("savedChats"));
      const found = savedChats.findIndex(element => {
        if(element.hasOwnProperty('buttonElement')){
          return element.buttonElement.includes(button.textContent);
        }
      });
      let totalFeesBackup = 0;
      const disconnect = this.store
      .select(fromStore.getCurrentChildState)
      .subscribe((val: any) => {
        const { child_info, total_tuition_fees } = val as ChildrenState;
        totalFeesBackup = total_tuition_fees;
        arrayOfChildren = Array.from(child_info.values());
        // console.log(arrayOfChildren);
      });
      let totalCostOfBooks = 0;
      let totalTuitionFees = 0;
      
     
     
      const html = arrayOfChildren.map((elem, index, arr) => {
        const childTuition = arrayOfChildren[index].tuition_fees && arrayOfChildren[index].tuition_fees  != ''  ? arrayOfChildren[index].tuition_fees : arrayOfChildren[index].tuition
         const className = schoolClasses.find(schoolclass => schoolclass.id == elem.class);
          const string = `<div class="ui card" style="box-shadow: none !important;border-radius: 0;margin: .5em 0;">
                <div class="header modified__header" style="padding-left: .5em"> ${elem.full_name}</div>
            </div>
      <div class="content" style="padding: .5em .5em;">
        <div class="ui small feed">
          <div class="event">
            <div class="content" >
              <div class="summary">
                 <a> Class </a>: <a> ${className.name} </a>
              </div>
            </div>
          </div>
          <div class="event">
             <div class="content">
               <div class="summary">
                  <a> Tuition Fees </a>: <a> ₦${new Intl.NumberFormat('en').format(Number(childTuition))} </a>
               </div>
             </div>
           </div>
           <div class="event">
             <div class="content">
               <div class="summary">
                  <a> Feeding </a>: <a> ₦${new Intl.NumberFormat('en').format(Number(elem.feeding)) || Number('0').toFixed(2) } </a>
               </div>
             </div>
           </div>

           <div class="event">
             <div class="content">
               <div class="summary">
                  <a> Uniforms </a>: <a> ₦${new Intl.NumberFormat('en').format(Number(elem.uniform)) || Number('0').toFixed(2) } </a>
               </div>
             </div>
           </div>

           <div class="event">
             <div class="content">
               <div class="summary">
                  <a> Transport </a>: <a> ₦${new Intl.NumberFormat('en').format(Number(elem.transport)) || Number('0').toFixed(2) } </a>
               </div>
             </div>
           </div>

           ${
             elem.total_cost_of_books > 0 ? 
             `<div class="event">
             <div class="content">
               <div class="summary">
                  <a> Cost of books selected </a>: <a> ₦${elem.total_cost_of_books} </a>
               </div>
             </div>
           </div>` : ''
           }
           
        </div>
      </div>
    </div>`
    return string;
      }).join('');
    
    totalCostOfBooks = arrayOfChildren.reduce((prev, elem, index, arr) => {
        if(elem.hasOwnProperty('total_cost_of_books') && elem.total_cost_of_books){
          prev += Number(elem.total_cost_of_books);
        }
        return prev;
    }, totalCostOfBooks)
    totalTuitionFees = totalFeesBackup;
    //   arrayOfChildren.reduce((prev, elem, index, arr) => {
    //   if(elem.hasOwnProperty('tuition_fees') && elem.tuition_fees && elem.tuition_fees != ''){
    //     prev += Number(elem.tuition_fees);
    //   }else{
    //     prev+= totalFeesBackup;
    //   }
    //   return prev;
    // }, totalTuitionFees);
    
    const calculatedTotals = `<div class="event mt-2" style="border-top: 1px solid rgba(10, 38, 59, 0.85);padding-top: 6px;">
      <div class="content">
        <div class="summary">
           <a> ${totalCostOfBooks > 0 ? 'Total Cost of fees and books': 'Total Fees'} </a>: <a> ₦${
             totalCostOfBooks > 0 ? new Intl.NumberFormat('en').format( totalFeesBackup + totalCostOfBooks + totalTuitionFees ): 
             new Intl.NumberFormat('en').format( totalTuitionFees ) || new Intl.NumberFormat('en').format( totalFeesBackup)} </a>
        </div>
      </div>
    </div>`
    
    const newString = html.concat(calculatedTotals);
    disconnect.unsubscribe();
    const elementZone = savedChats[found].htmlElement;
    const thisMessageWillReplaceOldMessage: Partial<Message> = 
    {
      countForMessage: 0, 
      direction: 'left',
      htmlElement: elementZone,
      text: newString
    }

    savedChats.splice(found, 1, thisMessageWillReplaceOldMessage as Message);
    sessionStorage.setItem('savedChats', JSON.stringify(savedChats));
    resolve(newString);
    })
  }
 

  arrangeSummaryFromChildDetailsSubmissionForWideScreen(htmlElement: HTMLElement): Promise<HTMLDivElement>{
    return new Promise((resolve, reject) => {
      let arrayOfChildren: Partial<AChild>[] = [];
      let totalCostOfFees: number = 0;
      let totalCostOfBooks: number = 0;
      let totalFeesBackup: number = 0;
      const button = htmlElement.querySelector('.button-container').firstChild;
      const schoolClasses: SchoolClass[] = JSON.parse(sessionStorage.getItem('school_classes'));
      const savedChats: Array<Message> = JSON.parse(sessionStorage.getItem("savedChats"));
      const found = savedChats.findIndex(element => {
        if(element.hasOwnProperty('buttonElement')){
          return element.buttonElement.includes(button.textContent);
        }
      });
      const disconnect = this.store
      .select(fromStore.getCurrentChildState)
      .subscribe((val: any) => {
        const { child_info, total_tuition_fees } = val as ChildrenState;
        totalFeesBackup = total_tuition_fees;
        arrayOfChildren = Array.from(child_info.values());
      });
      // make sure to check the media query of the device before showing the table
      // do this later. For now just show the table data.

     totalCostOfBooks = arrayOfChildren.reduce((prev, elem, index, arr) => {
        if(elem.hasOwnProperty('total_cost_of_books') && elem.total_cost_of_books){
          prev += Number(elem.total_cost_of_books);
        }
        return prev;
      }, totalCostOfBooks);
    //  totalCostOfFees = arrayOfChildren.reduce((prev, elem, index, arr) => {
    //     if(elem.hasOwnProperty('tuition_fees') && elem.tuition_fees && elem.tuition_fees != ''){
    //       prev += Number(elem.tuition_fees);
    //     }else{
    //       prev+= totalFeesBackup;
    //     }
    //     return prev;
    //   }, totalCostOfFees);

      totalCostOfFees = totalFeesBackup;
      //  generate tableData
      const produceTableData = (): HTMLTableElement => {
        let tableContent: HTMLTableElement = document.createElement('table');
        const tableHeading = document.createElement('thead'); 
        const tableHeadingRow = document.createElement('tr');
        const tableBody = document.createElement('tbody');
        
       
        for(let i = 0; i < 1; i++){
          if(arrayOfChildren[i].hasOwnProperty('full_name')){
            const tableHeadingInner = document.createElement('th')
            tableHeadingInner.textContent = 'Name';
            tableHeadingRow.insertAdjacentElement('beforeend', tableHeadingInner);
          }
          if(arrayOfChildren[i].hasOwnProperty('class')){
           const tableHeadingInner = document.createElement('th')
           tableHeadingInner.textContent = 'Class';
           tableHeadingRow.insertAdjacentElement('beforeend', tableHeadingInner);

         }
         if(arrayOfChildren[i].hasOwnProperty('tuition_fees')){
             const tableHeadingInner = document.createElement('th')
             tableHeadingInner.textContent = 'Tuition Fees';
             tableHeadingRow.insertAdjacentElement('beforeend', tableHeadingInner);
         }

         if(arrayOfChildren[i].hasOwnProperty('feeding')){
          const tableHeadingInner = document.createElement('th')
          tableHeadingInner.textContent = 'Feeding';
          tableHeadingRow.insertAdjacentElement('beforeend', tableHeadingInner);
      }
          if(arrayOfChildren[i].hasOwnProperty('transport')){
            const tableHeadingInner = document.createElement('th')
            tableHeadingInner.textContent = 'Transport';
            tableHeadingRow.insertAdjacentElement('beforeend', tableHeadingInner);
        }

        if(arrayOfChildren[i].hasOwnProperty('uniform')){
          const tableHeadingInner = document.createElement('th')
          tableHeadingInner.textContent = 'Uniform';
          tableHeadingRow.insertAdjacentElement('beforeend', tableHeadingInner);
      }


         tableHeading.insertAdjacentElement('afterbegin', tableHeadingRow)
        }


       
        tableContent.classList.add('ui', 'celled', 'table');
        tableContent.insertAdjacentElement('afterbegin', tableHeading);

        // add the contents, i.e data in the table.

        const arrOfTR: Array<HTMLTableRowElement> = arrayOfChildren.map((element, index, arr) => {
          const tableRow = document.createElement('tr');
          
          if(element.hasOwnProperty('full_name')) {
            const tableData = document.createElement('td');
            tableData.textContent = element.full_name;
            tableData.setAttribute('data-label', 'Name');
            tableRow.insertAdjacentElement('afterbegin', tableData);
          }
          if(element.hasOwnProperty('class')){
            const tableData = document.createElement('td');
            tableData.setAttribute('data-label', 'Class');
            const classname = schoolClasses.find(schoolclass => schoolclass.id == element.class);
            tableData.textContent = classname.name;
            tableRow.insertAdjacentElement('beforeend', tableData)
          }
          
          if(element.hasOwnProperty('tuition_fees')){
            const tableData = document.createElement('td');
            tableData.setAttribute('data-label', 'Tuition Fees');
            tableData.textContent = `₦${new Intl.NumberFormat('en').format(Number(element.tuition_fees || element.tuition))}`;
            tableRow.insertAdjacentElement('beforeend', tableData)
          }

          if(element.hasOwnProperty('feeding')){
            const tableData = document.createElement('td');
            tableData.setAttribute('data-label', 'Feeding');
            tableData.textContent = `₦${new Intl.NumberFormat('en').format(Number(element.feeding || 0))}`;
            tableRow.insertAdjacentElement('beforeend', tableData)
          }

          if(element.hasOwnProperty('transport')){
            const tableData = document.createElement('td');
            tableData.setAttribute('data-label', 'Transport');
            tableData.textContent = `₦${new Intl.NumberFormat('en').format(Number(element.transport || 0))}`;
            tableRow.insertAdjacentElement('beforeend', tableData)
          }

          if(element.hasOwnProperty('uniform')){
            const tableData = document.createElement('td');
            tableData.setAttribute('data-label', 'Uniform');
            tableData.textContent = `₦${new Intl.NumberFormat('en').format(Number(element.uniform || 0))}`;
            tableRow.insertAdjacentElement('beforeend', tableData)
          }
          return tableRow;
        })

        arrOfTR.forEach(element => {
          tableBody.insertAdjacentElement('beforeend', element)
        })
        tableContent.insertAdjacentElement('beforeend', tableBody)
        return tableContent;
      }
     
      const div = document.createElement('div');
      const Atabledata = produceTableData();
      div.insertAdjacentElement('beforeend', Atabledata);
      const header = document.createElement('h5');
      header.classList.add('para-title', 'mb-1');
      header.insertAdjacentHTML('beforeend', `Summary`);
      div.insertAdjacentElement('afterbegin', header);
      div.style.overflowX = 'auto';

      const footer = document.createElement('p');
      footer.textContent = totalCostOfBooks > 0 ? `Total Cost of Fees and Books: ₦${new Intl.NumberFormat('en').format(totalCostOfBooks + totalCostOfFees)}` : `Total Cost of Fees: ₦${new Intl.NumberFormat('en').format(totalCostOfFees)}`;
      div.insertAdjacentElement('beforeend', footer);
      let html = document.createElement('div');
      html.insertAdjacentElement('afterbegin', div);
      


      const elementZone = savedChats[found].htmlElement;
      const thisMessageWillReplaceOldMessage: Partial<Message> = 
      {
        countForMessage: 0, 
        direction: 'left',
        htmlElement: elementZone,
        text: html.outerHTML
      }

      savedChats.splice(found, 1, thisMessageWillReplaceOldMessage as Message);
      sessionStorage.setItem('savedChats', JSON.stringify(savedChats));
      disconnect.unsubscribe();
      resolve(html);
      
    })
  }

  insertProcessingBeforeSchoolDetailsLoad(ul: HTMLElement, position?: InsertPosition){
    const str = `<div class="chat-box__wrapper left pre_loader">  
    <div class="chat-box__inner-wrapper">
      <img src="../../../assets/chatbotImages/avatar.png" alt="" class="avatar">
      <div class="chat-box__text-wrapper">
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
       
      </div>
    </div>
  </div>`

   ul.insertAdjacentHTML(position ? position: 'afterbegin', str);

  }


  startQuestionnaire(){
      this.stringIndexOfCurrentQuestion = this.iteratorForKeys.next().value;
      this.currentQuestion = this.iterator.next().value;
      this.insertQuestionsIntoDOM(); 
  }


  insertQuestionsIntoDOM(){
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    // const string = (this.currentQuestion.answers as Array<any>).reduce((acc, elem, index, arr) => {
    //    acc+= `<span class="command"> ${index + 1} <strong> ${elem} </strong> </span> ${index == arr.length - 1 ? '': '<hr />'}`;
    //    return acc;
    // }, '')
    const buttonString = this.buttonFactory(this.currentQuestion.answers as Array<string>, this.currentQuestion.question)
    let anotherHtml = `
            <div data-time="1619036364151" class="chat-box__wrapper left">
                <div class="chat-box__inner-wrapper">
                   <div class="chat-box__text-wrapper ">
                     ${this.currentQuestion.question}
                     <br />
                  </div>
                </div>
              </div>`;

    let template = document.createElement('template');
    anotherHtml = anotherHtml.trim();
    template.innerHTML = anotherHtml;
    const converted = template.content.firstElementChild;
    converted.querySelector('.chat-box__text-wrapper').insertAdjacentElement('beforeend', buttonString);

    (this.messagePlaceHolder.nativeElement as HTMLElement).insertAdjacentElement('beforeend', converted);
    // const stringInButton = (this.currentQuestion.answers as Array<any>).reduce((acc, elem, index, arr) => {
    //      acc+=  index == arr.length - 1 ? `${elem},` : `${elem}`;
    //      return acc;
    //   }, '')
    // this.displaySubsequentMessages({
    //   message: this.currentQuestion.question,
    //   direction: 'left',
    //   button: stringInButton,
    // })
   
  }

  buttonFactory(arrayOfStrings: Array<string>, question: string): HTMLElement{
    const buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
      for (let i = 0; i < arrayOfStrings.length; i++) {
        const button = document.createElement("button");
        button.setAttribute(
          "data-button",
          `${question}`
        );
        button.className = "btn btn button--no-width dynamicButton";
        button.textContent = arrayOfStrings[i];
        // attaches the click listener to the generated button
        button.onclick = this.handleAnswerClick;
       
        buttonContainer.insertAdjacentElement("beforeend", button);
      }
      return buttonContainer;
  }

  handleAnswerClick(event: MouseEvent){
    const buttonClicked = event.target as HTMLButtonElement;
    this.displaySubsequentMessages({
      message: buttonClicked.textContent,
      direction: 'right'
    })
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement('allow');
    this.arrangeAnswersAndQuestions(buttonClicked.textContent);
    this.getNextQuestion();
  }

  async handleUserIdForQuestions(id: any, ulElement: HTMLElement): Promise<any>{
    this.insertProcessingBeforeSchoolDetailsLoad(ulElement);
    sessionStorage.setItem('request_id', id);
    try {
     const res = await this.chatservice.fetchQuestions(id);
     return new Promise((resolve, reject) => resolve(res))
    } catch (error) {
      return new Promise((resolve, reject) => resolve({error: 'An error occured!'}))
    }
    

  }

  sendQuestionsAndAnswersToServer(answers){
    const ul = this.messagePlaceHolder.nativeElement;
    this.insertProcessingBeforeSchoolDetailsLoad(ul, 'beforeend');
    this.chatservice.submitQuestionAndAnswer(answers).subscribe(
      val => {
        const preLoader = document.querySelector('.pre_loader');
        preLoader ? ul.removeChild(preLoader): null;
        this.displaySubsequentMessages({
          message: `Thank you for answering ${this.collectedAnswer.size == 1 ? 'the': 'these'} question.`,
          direction: 'left'
        })
        sessionStorage.clear();
      },
      err => console.log(err)
    )
  }
 


  ngOnDestroy() {
    this.observableToTrash.forEach(element => element.unsubscribe());
  }
}
