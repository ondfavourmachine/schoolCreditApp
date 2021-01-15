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
  view: "" | "verification" | "email" | "activate-email" = "";
  pageViews: string[] = [
    "",
    "verification",
    "phone",
    "email",
    "activate-email"
  ];
  phoneVerificationForm: FormGroup;
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
    const {emailOrPhone} = form.value;
    let formToSubmit = {guardian : this.parentDetails.guardian}
    if(this.generalservice.emailRegex.test(emailOrPhone)){
        formToSubmit['phone'] = emailOrPhone
    }else{
      formToSubmit['email'] = emailOrPhone;
    }
    try{
     const res =  await this.chatapi.changePhoneOrEmail(formToSubmit);
      this.generalservice.successNotification(res.message);
      this.spinner = false;
      this.closeModal();
    }catch(e){
      console.log(e);
      this.generalservice.warningNotification('Error occured!');
      this.spinner = false;
      this.closeModal();
    }
  }

  async sendOTP(phoneNumber: string) {
    // this.spinner = true;
    this.view = "verification";
    this.previousPage.emit("");
    // try {
    //   const res = await this.chatapi.dispatchOTP({ phone: phoneNumber });
    //   const refreshedState: Partial<Parent> = { OTP_sent: true };
    //   this.store.dispatch(new generalActions.addParents(refreshedState));
    //   this.spinner = false;
    //   this.generalservice.successNotification(
    //     `OTP has been sent to ${phoneNumber}`
    //   );
    //   this.spinner = false;
    //   // this.view = "verification";
    //   // this.changeToAnotherView();

    // } catch (error) {
    //   console.log(error);
    //   this.spinner = false;
    // }
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

  confirmEmailCode(form: FormGroup) {
    console.log(form.value);
  }

  sendActivationCodeToEmail(email: string) {}

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
