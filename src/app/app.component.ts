import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  OnChanges,
  AfterContentChecked
} from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { GeneralService } from "./services/generalService/general.service";
import { Subscription } from "rxjs";
import { Alert } from "./models/Alert";
import { replyGiversOrReceivers } from "./models/GiverResponse";
import * as generalActions from "./store/actions/general.action";
import { Store } from "@ngrx/store";
declare var $: any;

interface observableAggregator {
  flowControl?: Subscription;
  intermediateResponse?: Subscription;
  smartView?: Subscription;
}
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent
  implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  // public flowControlHolder: string = 'welcomeModal';
  public showModal: string = "none";
  public modalHolder: HTMLDivElement;
  public toKYCComponent: any;
  private btnTrigger: HTMLButtonElement;
  private observableAggregator: observableAggregator = {};
  public globalOverlay: string = "none";
  public confirmationDialog = false;
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  countDownDate: Date | number;
  intervalID: any;
  goBack: string = "firstPage";
  errorHouse: { error: Alert } = { error: new Alert(false, "") };
  changeStyles: boolean = false;
  constructor(
    private router: Router,
    public generalservice: GeneralService,
    private store: Store,
    private cd: ChangeDetectorRef,
  ) {
    this.intervalID = setInterval(() => this.startCountDownTimer(), 1000);
    router.events.subscribe(
      event => {  
        if(event instanceof NavigationStart){
          // if(event.url.includes('school')){
          //   (document.querySelector('.overlay') as HTMLElement).style.display = 'none';
          //   (document.querySelector('.overlay') as HTMLElement).style.zIndex = '-1';
          //   clearInterval(this.intervalID);
          //   return;
          // }
          if(event.url.includes('teacher')){
            (document.querySelector('.overlay') as HTMLElement).style.display = 'none';
            (document.querySelector('.overlay') as HTMLElement).style.zIndex = '-1';
            clearInterval(this.intervalID);
            return;
          }
          if(event.url.includes('user')){
            (document.querySelector('.overlay') as HTMLElement).style.display = 'none';
            (document.querySelector('.overlay') as HTMLElement).style.zIndex = '-1';
            clearInterval(this.intervalID);
            return;
          }
        }
      }
    )
  }

  startCountDownTimer(){
    this.countDownDate = new Date('July 31, 2021 00:00:00').getTime();
    const now = Date.now();
    const diff = this.countDownDate - now;
    const second = 1000;
    const minutes = second * 60;
    const hours = minutes * 60;
    const days = hours * 24;

    this.days = Math.floor(diff / days);
    this.hours = Math.floor( (diff % days) / hours);  
    this.minutes = Math.floor(( diff  % hours) /minutes);
    this.seconds = Math.floor(( diff % minutes) / second);

  }

  setPageToGoBackTo(event) {
    console.log(event);
    this.goBack = event;
  }

  ngOnInit() {
    // this.router.events.subscribe(
    //   event => {
    //     if(event instanceof NavigationStart){
    //       if(event.url.includes('user')){
    //         (document.querySelector('.overlay') as HTMLElement).style.zIndex = '-1';
    //       }
    //     }
    //   }
    // )
    
    this.generalservice.controlGlobalNotifier$.subscribe(val => {
      if (val == "on") {
        this.globalOverlay = "flex";
      } else {
        this.globalOverlay = "none";
      }
    });

    this.observableAggregator.flowControl = this.generalservice.flowCtrl$.subscribe(
      val => {
        // String(val)
        // verify-parent-data
        // sessionStorage.getItem('editChild') ? 'edit-child-information' : 'child-information-forms';
        this.generalservice.flowControlHolder = String(val);
        if (String(val).length < 1) {
          this.switchOfModal();
          return;
        }
        this.clickAButton();
      }
    );

    this.observableAggregator.intermediateResponse = this.generalservice.intermediateResponse$.subscribe(
      val => {
        if (!val || !val["message"]) {
          // console.log(val);
          return;
        }

        // closeBtn.click();
      }
    );

    this.observableAggregator.smartView = this.generalservice.smartView$.subscribe(
      val => {
        if (val) {
          if (
            (this.generalservice.flowControlHolder as string)
              .trim()
              .substring(4)
              .toLowerCase()
              .includes(val.component)
          ) {
            this.changeStyles = true;
          }

          if (
            val.info.includes("schoolBooks") ||
            val.component == "school-books"
          ) {
            this.changeStyles = true;
          } else {
            this.changeStyles = false;
          }
        }
      }
    );
  }

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.modalHolder = document.getElementById("myModal") as HTMLDivElement;
    this.btnTrigger = document.getElementById(
      "btnTrigger"
    ) as HTMLButtonElement;
  }

  // programmatically click the modal close button
  clickAButton() {
    this.btnTrigger.click();
  }

  // this function will choose to grey out buttons added dynamically or not to
  preventHidingOfbuttons(explicitInstruction?: string) {
    this.generalservice.flowControlHolder = "";
    try {
      // try to get the timer if it is in the dom
      const html = document.querySelector(".timer").querySelector("span");
      if (html.innerHTML) {
        try {
          let strong = html.querySelector("strong").textContent;
          if (strong.toString() == "0") {
            this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
              "allow"
            );
            this.switchOfModal();
            return;
          }
        } catch (e) {
          this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
            "allow"
          );
          this.switchOfModal();
          return;
        }

        this.errorHouse.error = new Alert(
          true,
          "You cannot leave now. Try to complete the test."
        );
        this.generalservice.removeErrorAlert(this.errorHouse, 6000);
      } else {
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
          "prevent"
        );
      }
    } catch (e) {
      // relic from credible
      if (
        explicitInstruction == "Upload Drivers License" ||
        "Terms And Condition" ||
        "BVN and Date Of Birth" ||
        "Bio and Next Of Kin" ||
        "Residential Address" ||
        "Work and Income Information" ||
        "Upload Photo and bank statement"
      ) {
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
          "prevent"
        );
        this.switchOfModal();
        return;
      }

      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      this.switchOfModal();
    }
    // let dontShow: string;
  }

  // launch the modal on button click
  lauchModal() {
    this.showModal = "block";
  }

  switchOfModal() {
    this.showModal = "none";
    // console.log(this.showModal);
  }

  // unsubscribe to prevent memory leaks
  ngOnDestroy() {
    this.observableAggregator.flowControl.unsubscribe();
    this.observableAggregator.intermediateResponse.unsubscribe();
    clearInterval(this.intervalID);
  }

  fakeButtonForUserOnly() {
    if (
      document.getElementById("knowYourReceiver") ||
      document.getElementById("receiver-bank") ||
      document.getElementById("receiver-picture") ||
      document.getElementById("receiver-confirm")
    ) {
      this.confirmationDialog = true;
    } else {
      this.switchOfModal();
      this.cancel();
      this.manageClosureOfModal(this.generalservice.flowControlHolder);
    }
  }

  cancel() {
    this.confirmationDialog = false;
  }

  resetEverything() {
    this.switchOfModal();
    this.cancel();
    this.handleResetEverythingScenario();
  }

  handleResetEverythingScenario() {
    const response = new replyGiversOrReceivers(
      `Whenever your ready, we can help you get assistance.`,
      "left",
      `Ok let's continue`,
      "receive"
    );
    // this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("prevent");
    this.generalservice.responseDisplayNotifier(response);

    setTimeout(() => {
      this.generalservice.reEnableUploadButton(`Ok let's continue`);
    }, 600);

    // this.displaySubsequentMessages(response);
  }

  manageClosureOfModal(val: string) {
    let chatbotResponse: replyGiversOrReceivers;
    switch (val) {
      case "bank-partnership":
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        chatbotResponse = new replyGiversOrReceivers(
          `Please wait while we process your loan application....`,
          `left`,
          "anything,nothing", // please these buttons are completely useless and will not be presented in the dom
          "anything,nothing",
          undefined,
          { classes: ["truncated_loan_process"] }
        );
        this.store.dispatch(new generalActions.checkLoanProcess("failed"));
        this.generalservice.responseDisplayNotifier(chatbotResponse);

        break;
      case "parent-account-form":
        // if( document.getElementById('divforIframe')){
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        chatbotResponse = new replyGiversOrReceivers(
          `Please wait while we process your card details....`,
          `left`,
          "anything,nothing", // please these buttons are completely useless and will not be presented in the dom
          "anything,nothing",
          undefined,
          { classes: ["processing_tokenized_card"] }
        );

        this.generalservice.responseDisplayNotifier(chatbotResponse);
        this.store.dispatch(
          new generalActions.checkTokenizeProcess("checking")
        );
        // }
        break;
    }
  }
}
