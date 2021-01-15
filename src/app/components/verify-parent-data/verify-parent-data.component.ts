import { Component, OnInit, OnDestroy } from "@angular/core";
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
export class VerifyParentDataComponent implements OnInit, OnDestroy {
  view: "" | "verification" | "email" = "";
  phoneVerificationForm: FormGroup;
  spinner: boolean = false;
  parentDetails: Partial<Parent>;
  destroy: Subscription[] = [];
  constructor(
    private fb: FormBuilder,
    private chatapi: ChatService,
    private store: Store<fromStore.AllState>,
    private generalservice: GeneralService
  ) {}

  ngOnInit(): void {
    this.phoneVerificationForm = this.fb.group({
      OTP: ["", Validators.required]
    });

    this.destroy[1] = this.store
      .select(fromStore.getParentState)
      .pipe(pluck("parent_info"))
      .subscribe(val => (this.parentDetails = val as Partial<Parent>));
  }

  async sendOTP(phoneNumber: string) {
    this.spinner = true;
    try {
      const res = await this.chatapi.dispatchOTP({ phone: phoneNumber });
      const refreshedState: Partial<Parent> = { OTP_sent: true };
      this.store.dispatch(new generalActions.addParents(refreshedState));
      this.spinner = false;
      this.generalservice.successNotification(
        `OTP has been sent to ${phoneNumber}`
      );
      // this.changeToAnotherView();
      this.view = "verification";
    } catch (error) {
      console.log(error);
      this.spinner = false;
    }
  }

  async confirmVerification(form: FormGroup) {
    this.spinner = true;
    let guardian;
    //  i need to write selectors to stop doing this
    // const disconnect: Subscription = this.store
    //   .pipe(pluck("manageParent", "parent_info", "guardian"))
    //   .subscribe(val => (guardian = val));

    try {
      const { message } = await this.chatapi.verifyOTP({
        phone_OTP: form.value.OTP,
        guardian
      });
      if (message.toLowerCase() == "phone number has been validated!") {
        this.spinner = false;
        this.view = "email";
        // this.changeToAnotherView();
      }
    } catch (error) {
      this.generalservice.warningNotification(
        error.error.message || "You entered and incorrect otp!"
      );
      this.spinner = false;
    }
  }

  sendActivationCodeToEmail(email: string) {}

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
  }
}
