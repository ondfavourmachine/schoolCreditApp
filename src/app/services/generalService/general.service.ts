import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject, TimeoutError } from "rxjs";
import {
  QuestionsToAsk,
  DisplayQuestion,
  PercentageOfQuestion
} from "src/app/models/Questionaire";
import { Alert } from "src/app/models/Alert";
import { HttpErrorResponse } from "@angular/common/http";
import { ValidateRefResponse } from "../../models/validaterRefRes";
import { Stage } from "src/app/models/stages";
import {
  replyGiversOrReceivers,
  GiverResponse,
  ReceiversResponse
} from "src/app/models/GiverResponse";
import { Message } from "../../models/message";

@Injectable({
  providedIn: "root"
})
export class GeneralService {
  // properties
  public totalLengthOfQuestions: number = 0;
  public counter: number = 0;
  public allQuestions: Array<QuestionsToAsk> = [];
  public displayedQuestions: Array<DisplayQuestion> = [];
  public answersToSend: Array<any> = [];
  public nameOfModal: string = "";
  public questionsHasFinished: string = undefined;
  svg: any = `
  <svg  " xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: inherit; display: inline-block; shape-rendering: auto;" width="34px" height="20px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
          <g transform="rotate(183.438 50 50)">
            <path d="M50 15A35 35 0 1 0 74.74873734152916 25.251262658470843" fill="none" stroke="#cccccc" stroke-width="12"></path>
            <path d="M49 -3L49 33L67 15L49 -3" fill="#cccccc"></path>
            <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
          </g>
  `;
  // public modalPopUpBtn: HTMLButtonElement;

  // OBSERVABLES FOR INTER COMPONENT COMMUNICATIONS

  // 1.  this observable will control questions
  private questionsCtrlSubject = new Subject();
  public questionsCtrl$ = this.questionsCtrlSubject.asObservable();

  // 2. this observable will prevent the removal of buttons from the dom
  private preventDisableSubject = new Subject();
  public preventDisablingOfButtons$ = this.preventDisableSubject.asObservable();

  // 3. this subject is for intermediate responses to notify the user of the
  // next stages
  private intermediateResponseSubject = new BehaviorSubject(
    {} as GiverResponse
  );
  public intermediateResponse$ = this.intermediateResponseSubject.asObservable();

  // 4. this subject will be used to control the display of forms
  private formToDisplayControllerSubject = new BehaviorSubject("");
  public formControl$ = this.formToDisplayControllerSubject.asObservable();

  //5.  this observble is used for starting the questioning and controlling display
  // of questions. Multiple components will use it
  private questionnaireNotificationSubject = new Subject();
  public startAskingAndChangeQuestions$ = this.questionnaireNotificationSubject.asObservable();

  // 6. this observable is used to control the flow from termsandcondition to forms to questions
  private flowControllerSubject = new Subject();
  public flowCtrl$ = this.flowControllerSubject.asObservable();

  // 7. this observable announces the start of the chatbot
  private displayCongratulatoryMsgOrRegretMsgSubject = new BehaviorSubject("");
  public congratsOrRegrets$ = this.displayCongratulatoryMsgOrRegretMsgSubject.asObservable();

  // 7. i dont this observable is still in use and i will delete it soon
  private apiCallInstructionsSubject = new Subject();
  public apiCalls$ = this.apiCallInstructionsSubject.asObservable();

  //8. this observable is for controlling the timer shown to the user
  // multiple components have access to it.
  private timerSubject = new BehaviorSubject("");
  public timer$ = this.timerSubject.asObservable();

  //   this observable is for regulating the flow of display in the kyc component
  private commKYCSubject = new BehaviorSubject({});
  public commKYC$ = this.commKYCSubject.asObservable();

  //12. special observable for special scenarios
  public specialSubject = new BehaviorSubject("");
  public specialScenarios$ = this.specialSubject.asObservable();

  // 13 next reply observable
  public objToReply: replyGiversOrReceivers | GiverResponse | string;
  private nextReplySubject = new BehaviorSubject(this.objToReply);
  public nextReply$ = this.nextReplySubject.asObservable();

  //  toggle app loader
  public controlGlobalNotificationSubject = new Subject();
  public controlGlobalNotifier$ = this.controlGlobalNotificationSubject.asObservable();

  public typeOfPerson: string;
  public familyImage: File;
  public familyImageToConfirm: any;
  public switchOfModal: boolean = false;
  public receiver: string = "receiver";
  public location: any;
  constructor() {}

  nextReplyFromCovidRelief(obj: replyGiversOrReceivers) {
    this.nextReplySubject.next(obj);
  }
  controlQuestionsFlow(anything) {
    this.questionsCtrlSubject.next(anything);
  }
  responseDisplayNotifier(anything: GiverResponse | ReceiversResponse) {
    this.intermediateResponseSubject.next(anything);
  }

  notifyThatCongratsOrRegrets(anything: string): void {
    this.displayCongratulatoryMsgOrRegretMsgSubject.next(anything);
  }

  controlFormsToDisplay(anything) {
    this.formToDisplayControllerSubject.next(anything);
  }

  communicationForKYC(
    anything: { nextStage?: string; previousStage?: string } | string
  ) {
    this.commKYCSubject.next(anything);
  }

  timerController(anything: any): void {
    this.timerSubject.next(anything);
  }

  nextStageForReceiver(anything) {
    // this.timeHasElapsedSubject.next(anything);
  }

  welcomeMsgGenerator(anything: Message): void {
    // this.welcomeMsgSubject.next(anything);
  }

  makeApiCalls(obj: { makecall: string; To: string }) {
    this.apiCallInstructionsSubject.next(obj);
  }

  handleQuestioningProcess(anything: any) {
    this.questionnaireNotificationSubject.next(anything);
  }

  handleFlowController(anything): void {
    this.flowControllerSubject.next(anything);
  }

  modifyDate(str: string) {
    let arrOfDays: Array<any> = str.split("-");
    arrOfDays.reverse();
    let date = new Date(
      parseInt(arrOfDays[0]),
      parseInt(arrOfDays[1]) - 1,
      parseInt(arrOfDays[2])
    ).toString();

    return date;
  }

  modifyQuestions(): Array<DisplayQuestion> {
    if (
      this.allQuestions.length < 1
      // this.counter >= this.allQuestions.length
    ) {
      this.questionsHasFinished = "questions has finished!";
      return;
    }
    // console.log(this.allQuestions.length);
    let disp: DisplayQuestion = {};
    let temp: DisplayQuestion[] = [];
    // let progressLevel: PercentageOfQuestion = {};
    disp.id = this.counter;
    disp.id_of_question = this.allQuestions[this.allQuestions.length - 1].id;
    disp.question = this.allQuestions[this.allQuestions.length - 1].question;
    disp.options = this.allQuestions[this.allQuestions.length - 1].options;
    temp.push(disp);
    this.displayedQuestions.push(disp);
    this.allQuestions.splice(this.allQuestions.length - 1, 1);
    this.counter++;
    // console.log(this.allQuestions);
    return temp;
  }
  calculatePercentage(): PercentageOfQuestion {
    let progressLevel: PercentageOfQuestion = {};
    progressLevel.current_perentage =
      (this.displayedQuestions.length / this.totalLengthOfQuestions) * 100;
    return progressLevel;
  }

  tweakOptions(options: string) {
    if (options == null) {
      return null;
    }
    return options.toString().replace(/\[(.*?)\]/g, "$1");
  }

  // function for modifying the look and feel of the button
  // when there is an apicall or not
  loading4button(
    element: HTMLElement,
    apiCall: string,
    displayString?: string
  ) {
    const apibutton = `<button class="ui loading button">Loading</button>`;
    // const normalbutton = element
    if (element instanceof HTMLButtonElement) {
      switch (apiCall) {
        case "yes":
          element.innerText = "";
          element.disabled = true;
          // element.insertAdjacentHTML("beforeend", apibutton);
          element.innerHTML = `${displayString} ${this.svg}`;
          break;
        case "done":
          element.innerHTML = "";
          element.disabled = false;
          element.innerHTML = `${displayString || "Submit"}`;
      }
    } else {
      switch (apiCall) {
        case "yes":
          element.innerText = "";
          element.style.pointerEvents = "none";
          element.innerHTML = `${displayString} ${this.svg}`;
          break;
        case "done":
          element.innerHTML = "";
          element.style.pointerEvents = "auto";
          element.innerHTML = `${displayString || "Submit"}`;
      }
    }
  }

  // communication conduit to tell a component whether to disable a button or not
  ctrlDisableTheButtonsOfPreviousListElement(anything) {
    this.preventDisableSubject.next(anything);
  }

  handleValidRef(
    msg: ValidateRefResponse
  ): { message: string; direction: string; button?: string } {
    // debugger
    if (!msg.test_taken && !msg.stage) {
      sessionStorage.setItem("userinfo", JSON.stringify(msg.message));
      let name = sessionStorage.getItem("name");
      return {
        message: `
            Hi ${this.convertToTitleCase(
              name
            )}, We are about to begin this credibility test. It usually takes 5-10 mins
            to complete. Would you like to begin?
      `,
        direction: "left",
        button: "Yes,No"
      };
    } else if (msg.stage) {
      // do something here
      sessionStorage.setItem("userinfo", JSON.stringify(msg.message));
      // console.log(msg.stage);
      let stages: Partial<Stage> = this.checkForStages(msg.stage as object);
      // console.log(stages);
      // send an alert to somewhere to notify system of
      // the stage to start from
      let res = this.nextStagesForUser(stages);
      // console.log(res);
      sessionStorage.setItem("userhasProvidedThisStagePreviously", res);
      // this.responseDisplayNotifier();
      return null;
      // this.generalservice.startFromHere(stages)
    }
  }

  // this function will loop through the stage object
  // and seperate the truthy values of the truthy value
  checkForStages(stages: object): object {
    // console.log(stages);
    let response = {};
    for (let stage in stages) {
      if (!stages[stage]) {
        continue;
      }
      response[stage] = stages[stage];
    }
    // console.log(response);
    return response;
  }

  //handle Errors with reference checking
  handleRefCheckingError(
    err
  ): { message: string; direction: string; button?: string } {
    // console.log(err);
    if (err instanceof TimeoutError) {
      return {
        message:
          "Oops, i think you have slow internet. Please check your connection and try again",
        direction: "left"
      };
    } else {
      if (err instanceof HttpErrorResponse && err.status == 403) {
        if (err.error.message.includes("Test has already been Taken")) {
          return {
            message: `${err.error.message}. Enter a valid reference number to start`,
            direction: "left"
          };
        }

        return {
          message:
            "Sorry! your reference numbers seems to be off. Please check the reference number, re-enter it and try again",
          direction: "left"
        };
      } else {
        console.log("i am here");
        return {
          message:
            "We could not confirm your reference number at this time. Please check your internet and reload this page",
          direction: "left"
        };
      }
    }
  }

  nextStagesForUser(stages: Partial<Stage>) {
    let s: Partial<Stage> = {},
      element: string;
    s = { ...stages };
    let last = Object.keys(s).length;
    element = Object.keys(s)[last - 1];
    // console.log(element);
    return element;
  }

  checkIfUserIsOnline(): boolean {
    return window.navigator.onLine;
  }
  convertToTitleCase(str: string): string {
    return str.trim().substr(0, 1) + str.substring(1, str.length).toLowerCase();
  }

  removeErrorAlert(err: { error: Alert }, time?: number) {
    let t: number = !time ? 3500 : time;
    setTimeout(() => {
      err.error.errorBool = false;
      delete err.error;
    }, t);
  }

  // get welcomeMsgToDisplayFromMessageClass(){
  //   const ul = document.getElementById('messagesPlaceHolder')
  //   const msg = new Message(
  //     `${Message.welcomeMessagesGenerator()}`,
  //     `left`,
  //     ul
  //   )

  //   return msg
  // }
}
