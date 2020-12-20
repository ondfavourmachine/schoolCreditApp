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

interface observableAggregator {
  flowControl?: Subscription;
  intermediateResponse?: Subscription;
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
  errorHouse: { error: Alert } = { error: new Alert(false, "") };
  constructor(
    private router: Router,
    public generalservice: GeneralService,
    private cd: ChangeDetectorRef
  ) {
    router.events.subscribe(val => {
      if (val instanceof NavigationStart) {
        const { url } = val;
        generalservice.receiver = url.substring(1, url.length);
        // this.welcomeMsgCtrl(url);
      }
    });
  }

  ngOnInit() {
    this.generalservice.controlGlobalNotifier$.subscribe(val => {
      if (val == "on") {
        this.globalOverlay = "flex";
      } else {
        this.globalOverlay = "none";
      }
    });

    this.observableAggregator.flowControl = this.generalservice.flowCtrl$.subscribe(
      val => {
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
      case "parents-information":
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        chatbotResponse = new replyGiversOrReceivers(
          `The information you provided is still incomplete. Please when you are ready let's continue`,
          "left",
          "Register me",
          `continue,full_pay`,
          "prevent"
        );
        this.generalservice.responseDisplayNotifier(chatbotResponse);
        break;
      case "child-information-forms":
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        chatbotResponse = new replyGiversOrReceivers(
          "We need your child's information to help process your request. When you ready let's continue",
          "left",
          "Ok Let's continue",
          "enterchildinfo",
          "prevent"
        );
        this.generalservice.responseDisplayNotifier(chatbotResponse);
        break;
      case "bank-partnership":
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        chatbotResponse = new replyGiversOrReceivers(
          "There are financial institutions waiting to finance this credit. Whenever you are ready let's go",
          "left",
          "Ok I'm ready, No let's forget it",
          "connectme, notinterested",
          "prevent"
        );
        this.generalservice.responseDisplayNotifier(chatbotResponse);
        break;
      case "parent-account-form":
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        chatbotResponse = new replyGiversOrReceivers(
          `Whenever you are ready we can continue with the process`,
          "left",
          "Continue now",
          `addaccount`,
          "prevent"
        );
        this.generalservice.responseDisplayNotifier(chatbotResponse);
        break;
    }
  }
}
