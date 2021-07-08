import { ElementRef, Injectable } from "@angular/core";
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
import { ToastrService } from "ngx-toastr";
import { schoolCreditStage } from "src/app/models/data-models";
import * as generalActions from "../../store/actions/general.action";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class GeneralService {
  // properties
  public apiUrl =
    "https://sellbackend.creditclan.com/covidd/public/index.php/api/";
  public totalLengthOfQuestions: number = 0;
  public emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    //  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  public counter: number = 0;
  public allQuestions: Array<QuestionsToAsk> = [];
  public displayedQuestions: Array<DisplayQuestion> = [];
  public answersToSend: Array<any> = [];
  public nameOfModal: string = "";
  public questionsHasFinished: string = undefined;
  public uploadEvidenceOfTransferInProgress: boolean = false;
  public noOfevidencesOfTransferToUpload: any[] = [];
  public justFinishedGiving: boolean = false;
  public familiesForSelection: any[] = [];
  public familiesSelectedWithTransactionID: any[] = [];

  // OBSERVABLES FOR INTER COMPONENT COMMUNICATIONS

  // 1.  this observable will control questions
  private questionsCtrlSubject = new Subject();
  public questionsCtrl$ = this.questionsCtrlSubject.asObservable();

  // 2. this observable will prevent the removal of buttons from the dom
  private preventDisableSubject = new Subject();
  public preventDisablingOfButtons$ = this.preventDisableSubject.asObservable();

  // 3. this subject is for intermediate responses to notify the user of the
  // next stages
  private intermediateResponseSubject = new BehaviorSubject({} as
    | GiverResponse
    | ReceiversResponse
    | replyGiversOrReceivers);
  public intermediateResponse$ = this.intermediateResponseSubject.asObservable();

  // 4. this subject will be used to control the display of forms
  private formToDisplayControllerSubject = new BehaviorSubject("");
  public formControl$ = this.formToDisplayControllerSubject.asObservable();

  private answerSubject = new Subject();
  public answersToQuestions$ = this.answerSubject.asObservable();

  //5.  this observble is used for starting the questioning and controlling display
  // of questions. Multiple components will use it
  private questionnaireNotificationSubject = new BehaviorSubject(false);
  public questionsHasStarted$ = this.questionnaireNotificationSubject.asObservable().pipe(first());

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
  public objToReply: replyGiversOrReceivers | GiverResponse | string = '';
  private nextReplySubject = new BehaviorSubject(this.objToReply);
  public nextReply$ = this.nextReplySubject.asObservable();

  //  toggle app loader
  public controlGlobalNotificationSubject = new Subject();
  public controlGlobalNotifier$ = this.controlGlobalNotificationSubject.asObservable();
  //   communicate the next form to fill
  private nextStageForUserSubject = new BehaviorSubject("");
  public nextStageForUser$ = this.nextStageForUserSubject.asObservable();

  public resetSubject = new Subject();
  public reset$ = this.resetSubject.asObservable();

  public typeOfPerson: string;
  public familyImage: File;
  public familyImageToConfirm: any;
  public switchOfModal: boolean = false;
  public receiver: string = "receiver";
  // replies from chatbot
  public nextChatbotReplyToGiver: replyGiversOrReceivers;
  public nextChatbotReplyToReceiver: replyGiversOrReceivers;
  //
  public familyToReceiveCashDonation: any;
  public flowControlHolder: string;
  public familiesForCashDonation: Array<any> = [];
  public userDidNotProvideID = false;

  // this subject will allow me to notify a component that a particular view
  // needs to be shown
  private smartViewLoadingSubject = new BehaviorSubject(undefined);
  public smartView$ = this.smartViewLoadingSubject.asObservable()

  public location: any;
  constructor(private toastr: ToastrService) {}

  notifyThatQuestionsHasStartedOrEnded(val: boolean){
    this.questionnaireNotificationSubject.next(val)
  }

  answerBroadCast(answer: string){
    this.answerSubject.next(answer);
  }

  communicateNextStage(stage: string) {
    this.nextStageForUserSubject.next(stage);
  }

  nextReplyFromCovidRelief(obj: replyGiversOrReceivers) {
    this.nextReplySubject.next(obj);
  }
  controlQuestionsFlow(anything) {
    this.questionsCtrlSubject.next(anything);
  }
  responseDisplayNotifier(
    anything: GiverResponse | ReceiversResponse | replyGiversOrReceivers
  ) {
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

  handleSmartViewLoading(obj:{component: string, info: string}){
    this.smartViewLoadingSubject.next(obj)
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

  restrictInputDigits(event: Event, number: number) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.substring(0, number);
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

  // updateWidgets(arr: Array<string>, stages: schoolCreditStage, component: any): Array<string> {
  //   let tobeDeleted = [], tobeReIntegrated = [];
  //   Object.keys(stages).forEach((element, index, array) => {
  //     const found = arr.indexOf(element);
  //     if(found == -1 && element.startsWith('widget')){
  //       tobeDeleted.push(element);
  //     }
  //     if(found >= 0 && element.startsWith('widget')){
  //       tobeReIntegrated.push({[element] : stages[element]});
  //     }
  //     if(found == -1 && !element.startsWith('widget')){
  //       tobeReIntegrated.push({[element] : stages[element]});
  //     }
  //   })
  //   tobeReIntegrated.forEach(element => {
  //       if(Object.keys(element)[0] == 'widget_data'){
  //         component.store.dispatch(new generalActions.updateParentWidgetDataStage(Object.values(element)[0] as any))
  //       }
  //       if(Object.keys(element)[0] == 'widget_cashflow'){
  //         component.store.dispatch(new generalActions.updateParentWidgetCashflowStage(Object.values(element)[0] as any));
  //       }
  //       if(Object.keys(element)[0] == 'widget_card'){
  //         component.store.dispatch(new generalActions.updateParentWidgetCardStage(Object.values(element)[0] as any));
  //       }
  //     })
     
  //     return tobeReIntegrated;

  // }

  // function for modifying the look and feel of the button
  // when there is an apicall or not

  // communication conduit to tell a component whether to disable a button or not
  
  
  ctrlDisableTheButtonsOfPreviousListElement(anything) {
    this.preventDisableSubject.next(anything);
  }

  resetEverything(anything: string) {
    this.resetSubject.next(anything);
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

  reEnableUploadButton(specialCaseRequest?: string) {
    if (specialCaseRequest) {
      const buttons = document.querySelectorAll(
        `[data-button*="${specialCaseRequest}"]`
      ) as NodeList;
      let targetButton: HTMLButtonElement = buttons[
        buttons.length - 1
      ] as HTMLButtonElement;
      targetButton.classList.remove("disabled");
      targetButton.disabled = false;
      targetButton.style.pointerEvents = "auto";
      return;
    }
    let nl: NodeList = document.querySelectorAll(".dynamicButton");
    for (let i = nl.length - 1; i >= 0; i--) {
      // console.log(i);
      if (
        /upload/i.test(nl[i].textContent)
        // (nl[i] as HTMLButtonElement).classList.contains("disabled")
      ) {
        const but = nl[i] as HTMLButtonElement;
        but.classList.remove("disabled");
        but.disabled = false;
        but.style.pointerEvents = "auto";
      }
      if (i <= 2) break;
    }
  }

  getLocationOfUser() {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        this.findPerson,
        () => this.errorFindingPerson,
        { enableHighAccuracy: true }
      );
    }
  }

  findPerson(position) {
    const { longitude, latitude } = position.coords;
    let location = { latitude, longitude };
    // console.log(position);
    sessionStorage.setItem("userLatLng", JSON.stringify(location));
  }
  errorFindingPerson() {
    this.getLocationFromIp();
  }

  async getLocationFromIp() {
    try {
      const { longitude, latitude } = await (await fetch(
        "https://api.ipstack.com/check?access_key=2f2fdee3320b5dcebf5b167167dd96f2"
      )).json();
      let location = { latitude, longitude };
      // console.log(this.generalservice.location);
      sessionStorage.setItem("userLatLng", JSON.stringify(location));
      // this.verifyLocation(this.location);
    } catch (error) {
      console.log("Location error.. ", error);
    }
  }

  specialCaseButtons(
    buttons: Array<HTMLButtonElement> | NodeList,
    disable?: string
  ) {
    if (disable) {
      buttons.forEach((button: HTMLButtonElement) => {
        if (!button.classList.contains("disabled")) {
          button.classList.add("disabled");
          button.disabled = true;
          button.style.pointerEvents = "none";
        }
      });
      return;
    }
    buttons.forEach((button: HTMLButtonElement) => {
      if (
        button.textContent.toLowerCase().includes("yes") ||
        button.textContent.toLowerCase().includes("no i am giving") ||
        button.textContent.toLowerCase().includes("ok begin")
      ) {
        button.classList.add("disabled");
        button.disabled = true;
        button.style.pointerEvents = "none";
      }
    });
  }

  setStage(
    stageName: "child-info" | "parent-info" | "account-info" | "bank-form",
    stuffToSet: object
  ) {
    let previous = localStorage.length;
    if (previous == 0) {
      const stages = { [stageName]: stuffToSet };
      localStorage.setItem("stages", JSON.stringify(stages));
      return;
    }
    let previousStages = JSON.parse(localStorage.getItem("stages"));
    let newSetOfStages = { ...previousStages, [stageName]: stuffToSet };
    localStorage.setItem("stages", JSON.stringify(newSetOfStages));
  }

  getStage(): object {
    return JSON.parse(localStorage.getItem("stages"));
  }

  successNotification(message) {
    this.toastr.success(message, "Success");
  }

  warningNotification(message) {
    this.toastr.warning(message, "Stop");
  }

  errorNotification(message) {
    this.toastr.error(message, "Error");
  }

  async dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const res: Response = await fetch(dataUrl);
    const blob: Blob = await res.blob();
    return new File([blob], fileName, { type: "image/jpeg" });
  }

  makeReadable(value: string, element: HTMLElement){
    
    const correctedValue = value.split(',').join('');
    const newValue = new Intl.NumberFormat().format(Number(correctedValue));
    (element as HTMLInputElement).value = newValue;
  }

  fetchWordForNumber(num: number): string {
    const arrayOfWords = [
      "",
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
      "eighth",
      "nineth",
      "Tenth"
    ];
    let returnVal: string;
    arrayOfWords.forEach((element, index, array) => {
      if (index == num) {
        returnVal = array[num];
      }
    });
    return returnVal;
  }

  fileToDataurl(File: File | string): Promise<any> | string{
    let returnString;
    if(typeof File == 'string') return File;
   return new Promise((resolve, reject)=> {
    if (FileReader) {
      let reader = new FileReader();
      reader.onload = anevent => {
        returnString = `${anevent.target["result"]}`; 
        resolve(returnString);
      };
      reader.readAsDataURL(File);
    }
   }) 
  }



  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  
}
