import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { HttpErrorResponse } from "@angular/common/http";
import {
  AChild,
  Parent,
  schoolCreditStage
} from "src/app/models/data-models";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { pluck } from "rxjs/operators";
import { Subscription } from "rxjs";

interface checkWhoIsContinuing {
  phone?: string;
  email?: string;
  PIN?: string;
}

@Component({
  selector: "app-continuing-existing-requests",
  templateUrl: "./continuing-existing-requests.component.html",
  styleUrls: ["./continuing-existing-requests.component.css"]
})
export class ContinuingExistingRequestsComponent
  implements OnInit, AfterViewInit {
  @Output("previousPage") previousPage = new EventEmitter<string>();
  @Input("previous") previous: any;
  pageViews: string[] = ["", "four-digit-pin"];
  view:
    | ""
    | "four-digit-pin"
    | "pin_not_set"
    | "phone_verify"
    | "phone_verify_second"
    | "phone_verify_first" = "";
  arrayOfNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11];
  input: string = "";
  response: replyGiversOrReceivers = undefined;
  mapOfChildrensInfo: Map<string, Partial<AChild>> = new Map();
  nextStage: string;
  overlay: boolean = false;
  guardianID: string | number = undefined;
  listOfStagesForLater: Record<string, any> = {};
  spinner: boolean = false;
  checkWhoIsTryingToContinue: checkWhoIsContinuing = {};
  confirmPhoneOrEmailForm: FormGroup;
  contactPhoneForm: FormGroup;
  setUpPinForm: FormGroup;
  phoneOTPForm: FormGroup;
  destroy: Subscription[] = [];
  parentDetails: Partial<Parent>;
  constructor(
    public generalservice: GeneralService,
    private fb: FormBuilder,
    private chatservice: ChatService,
    private store: Store
  ) {
    this.manageGoingBackAndForth = this.manageGoingBackAndForth.bind(this);
  }

  ngOnInit(): void {
    this.generalservice.nextStageForUser$.subscribe(val => {
      this.nextStage = val;
    });
    this.confirmPhoneOrEmailForm = this.fb.group({
      phoneOrEmail: ["", Validators.required]
    });
    this.setUpPinForm = this.fb.group({
      pin_in_email: ["", Validators.required],
      new_pin: ["", Validators.required]
    });
    this.contactPhoneForm = this.fb.group({
      phone: ["", Validators.required]
    });
    this.phoneOTPForm = this.fb.group({
      OTP_for_phone: ["", Validators.required]
    });

    this.destroy[1] = this.store
      .select(fromStore.getParentState)
      .pipe(pluck("parent_info"))
      .subscribe(val => (this.parentDetails = val as Partial<Parent>));
  }

  ngAfterViewInit() {
    document
      .getElementById("backspace")
      .addEventListener("click", this.manageGoingBackAndForth);
  }

  async submitOTPFromPhone(form) {
    this.spinner = true;
    // const {phone} = this.contactPhoneForm.value;
    const res = await this.chatservice.verifyOTP({
      phone_OTP: form.value.OTP_for_phone,
      guardian: this.guardianID as string
    });
 
    this.spinner = false;
    const returnVal = this.rearrangeStaInOrderFashion(this
      .listOfStagesForLater as schoolCreditStage);
    this.continue(returnVal, this.parentDetails);
  }

  async submitContactPhone(form: FormGroup) {
    this.spinner = true;
    const { phone } = form.value;
    const res = await this.chatservice.verifyOTP({
      phone_OTP: phone,
      guardian: this.guardianID as string
    });
   
  }

  checkAndSetNewPin(form: FormGroup) {
    this.spinner = true;
 
    let obj = { token: "", pin: "", confirm_pin: "", email: "" };
    obj.token = form.value.pin_in_email;
    obj.pin = form.value.new_pin;
    obj.confirm_pin = form.value.new_pin;
    obj.email = this.checkWhoIsTryingToContinue.email;

    this.chatservice.submitParentWithoutPin(obj).subscribe(
      val => {
        this.view = "phone_verify_second";
        this.spinner = false;
      },
      err => {
        this.spinner = false;
        console.log(err);
        this.generalservice.errorNotification(
          "An error occured while trying to verify your"
        );
      }
    );
  }

  manageGoingBackAndForth() {
    if (this.view == this.previous) {
      const num = this.pageViews.indexOf(this.previous);
      const ans = this.pageViews[num - 1];
      this.view = ans as any;
      this.previousPage.emit(this.pageViews[this.pageViews.indexOf(ans) - 1]);
      return;
    }
    if (this.previous == "") {
      this.view = "";
      this.previousPage.emit("firstPage");
    } else {
      this.view = this.previous;
    }
  }

  get phoneOrEmail() {
    return this.confirmPhoneOrEmailForm.get("phoneOrEmail");
  }

  collectEntry(): void {
    this.spinner = true;
    const { phoneOrEmail } = this.confirmPhoneOrEmailForm.value;
    if (this.generalservice.emailRegex.test(phoneOrEmail)) {
      this.checkWhoIsTryingToContinue.email = phoneOrEmail;
      this.chatservice
        .checkIfParentHasPreviouslySavedPIN({
          email: this.checkWhoIsTryingToContinue.email
        })
        .subscribe(
          val => {
            this.spinner = false;
            this.view = "four-digit-pin";
            this.previousPage.emit("");
          },
          async (err: HttpErrorResponse) => {
            // this.generalservice.errorNotification(err.error.message);
            try {
              const res = await (this.chatservice.sendEmailOTP(
                { email: this.checkWhoIsTryingToContinue.email },
                "promise"
              ) as Promise<any>);
              this.generalservice.successNotification(res.message);
              this.view = "pin_not_set";
              this.spinner = false;
            } catch (error) {
              this.generalservice.errorNotification(error.error.message);
              this.spinner = false;
            }
          }
        );
      return;
    }
    this.checkWhoIsTryingToContinue.phone = phoneOrEmail;
    this.view = "four-digit-pin";
    this.spinner = false;
    this.previousPage.emit("");
  }

  checking(command?: "stop"): void {
    if (command) {
      document.querySelector(".checking").classList.remove("working");
      this.overlay = false;
      return;
    }
    this.overlay = true;
    document.querySelector(".checking").classList.add("working");
    // setTimeout(() => {

    // }, 1500);
  }

  enterContentIntoInput(event: Event) {
    const element = event.target as HTMLElement;
    if (element.classList.contains("backspace")) {
      this.input = this.input.substring(0, this.input.length - 1);
      return;
    }
    if (this.input.length < 4) {
      const key = element.textContent.trim();
      this.input += key;
    }
  }

  submitThisUser() {
    // debugger;
    this.checking();
    this.checkWhoIsTryingToContinue.PIN = this.input;
    const formToSubmit = { ...this.checkWhoIsTryingToContinue };
    // console.log(formToSubmit);
    this.chatservice.confirmParentPIN(formToSubmit as any).subscribe(
      async val => {
        const { stages } = val;
        const returnVal = this.rearrangeStaInOrderFashion(stages);
        // console.log(stages, returnVal);
        this.listOfStagesForLater = { ...stages };
        this.checking("stop");
        const {
          full_name,
          date_of_birth,
          phone,
          picture,
          email,
          address,
          gender,
          lga,
          state,
          type
        } = val.data.guardian_data;
        const infoToStore: Partial<Parent> = {
          full_name,
          date_of_birth,
          phone,
          picture,
          email,
          address,
          state,
          type,
          lga,
          gender,
          loan_request: val.loan_request,
          guardian: val.data.guardian
        };
        this.guardianID = val.data.guardian;
        this.store.dispatch(new generalActions.addParents(infoToStore));
        this.store.dispatch(new generalActions.updateParentWidgetCardStage(stages.widget_card));
        this.store.dispatch(new generalActions.updateParentWidgetDataStage(stages.widget_data));
        this.store.dispatch(new generalActions.updateParentWidgetCashflowStage(stages.widget_cashflow))
        if(stages.phone_verified == 0){
          try {
            await this.chatservice.dispatchOTP({ phone });
          } catch (error) {
            console.log(error);
          }
        }
        const childData = val.data.children;
        childData.length > 0 ? this.handleDataInsideChildren(childData) : null;
        this.continue(returnVal, val.data.guardian_data);
      },
      (err: HttpErrorResponse) => {
        this.generalservice.errorNotification(`${err.error.message}!`);
        this.checking("stop");
        console.log(err);
      }
    );
  }

  rearrangeStaInOrderFashion(stages: schoolCreditStage): string {
    // "parent_creditcard_info" should be the last
    const arrangedStages = [
      "parent_data",
      "email_validated",
      "phone_verified",
      "child_data",
      "widget_data",
      "widget_cashflow",
      "widget_card",
    ];
    let returnVal;
    for (let element of arrangedStages) {
      if (stages[element] == 0) {
        returnVal = element;
        break;
      }
    }
    return returnVal;
  }

  handleDataInsideChildren(childrenData: Partial<AChild>[]) {
    for (let i = 0; i < childrenData.length; i++) {
      const word = this.generalservice.fetchWordForNumber(i + 1);
      childrenData[i].index = i + 1;
      this.mapOfChildrensInfo.set(word, childrenData[i]);
    }
    // console.log(this.mapOfChildrensInfo);
    this.store.dispatch(new generalActions.addAChild(this.mapOfChildrensInfo));
    this.store.dispatch(new generalActions.calculateFees());
  }

  continue(stage: string, data: Partial<Parent>) {
    this.generalservice.nextChatbotReplyToGiver = undefined;
    // console.log(stage);
    switch (stage) {
      case "widget_data":
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.response = new replyGiversOrReceivers(
          `I see you previously provided your children's info`,
          "left",
          "",
          ``
        );
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.generalservice.handleFlowController("");
        this.generalservice.responseDisplayNotifier(this.response);
        setTimeout(() => {
          // const chatbotResponse = new replyGiversOrReceivers(
          //   `The school mandates that you add books required by your child or children`,
          //   'left',
          //   `Select Books`,
          //   `addbooks`,
          //   `allow`
          // )
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `Are you ready to be connected to a financial institution?`,
            "left",
            "Yes, No Later",
            `connectme, notinterested`,
            "allow"
          );
          const chatbotResponse = new replyGiversOrReceivers(
            `To fund this request, We have partnered with banks on your behalf`,
            "left",
            "",
            ``
          );

          // const chatbotResponse = new replyGiversOrReceivers(
          //     `The school mandates that you add books required by your child or children`,
          //   'left',
          //   `Select Books`,
          //   `addbooks`,
          //   `prevent`
       
          // )
          this.generalservice.responseDisplayNotifier(chatbotResponse);
        }, 800);
        break;
      case "child_data":
        this.response = new replyGiversOrReceivers(
          `Thank you for registering and verifying your contacts, ${data.full_name}`,
          "left",
          "",
          ``
        );
        this.generalservice.handleFlowController("");
        this.generalservice.responseDisplayNotifier(this.response);
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        setTimeout(() => {
          this.generalservice.nextChatbotReplyToGiver = undefined;
          const chatbotResponse = new replyGiversOrReceivers(
            `How would you like to pay?`,
            "left",
            "Instalmental payments, Full Payment",
            `installmental,fullpayment`,
            "prevent"
          );
          this.generalservice.responseDisplayNotifier(chatbotResponse);
        }, 800);
        break;
      case "parent_data":
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.generalservice.handleFlowController("");
        this.response = new replyGiversOrReceivers(
          `You haven't registered with this school fees payment service`,
          "left",
          "",
          ``
        );
        this.generalservice.responseDisplayNotifier(this.response);
        setTimeout(() => {
          this.generalservice.nextChatbotReplyToGiver = undefined;
          const nextresponse = new replyGiversOrReceivers(
            "We would like to quickly register you for this school fees payment service?",
            "left",
            "Continue",
            "continue,full_pay",
            "prevent"
          );
          this.generalservice.responseDisplayNotifier(nextresponse);
        }, 500);
        break;
      case "widget_cashflow":
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.generalservice.handleFlowController("");
        this.generalservice.nextChatbotReplyToGiver = undefined;
        const responseFromParent = new replyGiversOrReceivers(
          `Thanks for this information. A financial institution is preparing your final offer.`,
          "left",
          "",
          "prevent"
        );
        this.generalservice.responseDisplayNotifier(responseFromParent);
        this.spinner = false;
        setTimeout(() => {
          this.generalservice.nextChatbotReplyToGiver = undefined;
          const chatbotResponse = new replyGiversOrReceivers(
            `They will also like to know which account will we be debiting you from?`,
            "left",
            "Add Account",
            `addaccount`,
            "prevent"
          );
          this.generalservice.responseDisplayNotifier(chatbotResponse);
        }, 800);
        break;
      
      case "phone_verified":
        this.spinner = false;
        this.view = "phone_verify_second";

        break;
      case "widget_card":
        this.response = new replyGiversOrReceivers(
          `Thank you for providing your details,${data.full_name}. However we would like to get your card details. 
         This is a secure process so be rest assured we will not share your information with anybody.`,
          "left",
          "",
          ``
        );
        this.generalservice.handleFlowController("");
        this.generalservice.responseDisplayNotifier(this.response);
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        setTimeout(() => {
          this.generalservice.nextChatbotReplyToGiver = undefined;
          const chatbotResponse = new replyGiversOrReceivers(
            `Would you like to provide your debit card details now?`,
            "left",
            "Yes i'm ready, No later",
            `providedebitcard,nodebitcard`,
            "prevent"
          );
          this.generalservice.responseDisplayNotifier(chatbotResponse);
        }, 800);
        break;
    }
  }
}
