import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  Input,
  AfterViewInit
} from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { pluck } from "rxjs/operators";
import { Parent } from "src/app/models/data-models";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-verify-parent-data",
  templateUrl: "./verify-parent-data.component.html",
  styleUrls: ["./verify-parent-data.component.css"]
})
export class VerifyParentDataComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Output("previousPage") previousPage = new EventEmitter<string>();
  @Input("previous") previous: any;
  contactChange: "phone" | "email" = "phone";
  showModal: string = "none";
  view: "" | "verification" | "email" | "activate-email" | "four-digit-pin" =
    "";
  pageViews: string[] = [
    "",
    "verification",
    "phone",
    "email",
    "activate-email",
    "four-digit-pin"
  ];
  phoneVerificationForm: FormGroup;
  PINForm: FormGroup;
  emailVerificationForm: FormGroup;
  newPhoneNumberForm: FormGroup;
  spinner: boolean = false;
  parentDetails: Partial<Parent>;
  destroy: Subscription[] = [];
  constructor(
    private fb: FormBuilder,
    private chatapi: ChatService,
    private store: Store<fromStore.AllState>,
    private generalservice: GeneralService
  ) {
    this.manageGoingBackAndForth = this.manageGoingBackAndForth.bind(this);
  }

  iWantToChangeNumber(contact: "phone" | "email", functionName: string) {
    this.contactChange = contact;
    this[functionName]();
    this.newPhoneNumberForm.reset();
  }

  manageGoingBackAndForth() {
    if (this.view == this.previous) {
      const num = this.pageViews.indexOf(this.previous);
      const ans = this.pageViews[num - 1];
      this.view = ans as any;
      return;
    }
    if (this.previous == "") {
      this.view = "";
      this.previousPage.emit("firstPage");
    } else {
      this.view = this.previous;
    }
  }

  ngAfterViewInit() {
    document
      .getElementById("backspace")
      .addEventListener("click", this.manageGoingBackAndForth);
  }

  get type(): string {
    return this.contactChange == "phone" ? "tel" : "email";
  }

  get emailOrPhone() {
    return this.newPhoneNumberForm.get("emailOrPhone");
  }

  ngOnInit(): void {
    this.phoneVerificationForm = this.fb.group({
      OTP: ["", Validators.required]
    });

    this.emailVerificationForm = this.fb.group({
      email_activation: ["", Validators.required]
    });

    this.PINForm = this.fb.group({
      pin: ["", Validators.required]
    });

    this.newPhoneNumberForm = this.fb.group({
      emailOrPhone: [
        "",
        [
          Validators.required,
          () => (this.contactChange == "email" ? Validators.email : "")
        ]
      ]
    });

    this.destroy[1] = this.store
      .select(fromStore.getParentState)
      .pipe(pluck("parent_info"))
      .subscribe(val => (this.parentDetails = val as Partial<Parent>));
  }

  async modifyPrefferedContact(form: FormGroup) {
    this.spinner = true;
    const { emailOrPhone } = form.value;
    let formToSubmit = { guardian: this.parentDetails.guardian };
    if (this.generalservice.emailRegex.test(emailOrPhone)) {
      formToSubmit["email"] = emailOrPhone;
    } else {
      formToSubmit["phone"] = emailOrPhone;
    }
    try {
      const res = await this.chatapi.changePhoneOrEmail(formToSubmit);
      this.generalservice.successNotification(res.message);
      this.spinner = false;
      this.closeModal();
    } catch (e) {
      console.log(e);
      this.generalservice.warningNotification("Error occured!");
      this.spinner = false;
      this.closeModal();
    }
  }

  async sendOTP(
    phoneNumber: string,
    obj?: { element: HTMLElement | HTMLAnchorElement; text: string }
  ) {
    this.spinner = true;
    try {
      const res = await this.chatapi.dispatchOTP({ phone: phoneNumber });
      const refreshedState: Partial<Parent> = { OTP_sent: true };
      this.store.dispatch(new generalActions.addParents(refreshedState));
      this.spinner = false;
      this.generalservice.successNotification(
        `OTP has been sent to ${phoneNumber}`
      );

      this.spinner = false;
      this.view = "verification";
      this.previousPage.emit("");
      if (obj) obj.element.textContent = obj.text;
    } catch (error) {
      // console.log(error);
      if (obj) obj.element.textContent = obj.text;
      this.generalservice.warningNotification(
        ` ${error.error.message}`
      );
      this.spinner = false;
    }
  }

  async confirmVerification(form: FormGroup) {
    this.spinner = true;
    let guardianID;
    //  i need to write selectors to stop doing this
    const disconnect: Subscription = this.store
      .pipe(pluck("manageParent", "parent_info", "guardian"))
      .subscribe(val => {
        guardianID = val;
      });

    try {
      const { message } = await this.chatapi.verifyOTP({
        phone_OTP: form.value.OTP,
        guardian: guardianID
      });
      if (message.toLowerCase() == "phone number has been validated!") {
        this.spinner = false;
        this.view = "email";
        // this.previousPage.emit("");
        disconnect.unsubscribe();
        // this.changeToAnotherView();
      }
    } catch (error) {
      this.generalservice.warningNotification(
        error.error.message || "You entered and incorrect otp!"
      );
      this.spinner = false;
    }
  }

  saveParentInfo(form: FormGroup) {
    this.spinner = true;
    // const responseFromParent = new replyGiversOrReceivers(
    //   `I have provided my details`,
    //   "right"
    // );

    // this.generalservice.nextChatbotReplyToGiver = undefined;

    this.chatapi
      .saveParentPIN({
        pin: form.value.pin,
        guardian: this.parentDetails.guardian
      })
      .subscribe(
        val => {
          const responseFromParent = new replyGiversOrReceivers(
            `I have verified my email and phone number`,
            "right"
          );
          this.generalservice.nextChatbotReplyToGiver = undefined;
          this.generalservice.responseDisplayNotifier(responseFromParent);
          this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
            "allow"
          );
          this.spinner = false;
          this.previousPage.emit("firstPage");
          setTimeout(() => {
            this.generalservice.handleFlowController("");
            this.spinner = false;
            this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
              `How would you like to pay?`,
              "left",
              "Instalmental payments, Full Payment",
              `installmental,fullpayment`,
              "prevent"
            );
            this.spinner = false;
            // disconnect.unsubscribe();
            const chatbotResponse = new replyGiversOrReceivers(
              `Thank you for taking time to verify your details, ${this
                .parentDetails.full_name || "John Bosco"}`,
              "left",
              "",
              ``
            );
            this.generalservice.responseDisplayNotifier(chatbotResponse);
          }, 600);
        },
        (err: HttpErrorResponse) => {
          this.spinner = false;
          this.generalservice.errorNotification(err.error.message);
        }
      );
  }

  confirmEmailCode(form: FormGroup) {
    this.spinner = true;
    
    this.chatapi.verifyParentEmailActivationCode({token: form.value.email_activation, guardian: this.parentDetails.guardian})
    .subscribe(val => {
    const refreshedState: Partial<Parent> = { email_verified: 1 };
    this.store.dispatch(new generalActions.addParents(refreshedState));
    this.spinner = false;
    this.view = "four-digit-pin";
    this.previousPage.emit("activate-email");
    }, (err:HttpErrorResponse)=> {
      this.generalservice.warningNotification(err.error.message);
      this.spinner = false;
    })
    
  }

  resendCode(event: Event, contactType: "phone" | "email") {
    const element = event.target as HTMLAnchorElement;
    const prevText = element.textContent;
    element.textContent = "Resending....";
    contactType == "phone"
      ? this.sendOTP(this.parentDetails.phone, { element, text: prevText })
      : "";
  }

  sendActivationCodeToEmail(email: string) {
    this.spinner = true;
    this.chatapi.sendEmailOTP({email})
    .subscribe(val => {
      this.generalservice.successNotification("Activation code sent!");
      this.view = "activate-email";
      this.spinner = false;
    }, err=> {
      console.log(err);
      this.spinner = false;
      this.generalservice.warningNotification(`An error occured while sending activation otp to ${email}`)
    })
  }

  lauchModal() {
    this.showModal = "block";
  }

  closeModal() {
    this.showModal = "none";
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
    document
      .getElementById("backspace")
      .removeEventListener("click", this.manageGoingBackAndForth);
  }
}
