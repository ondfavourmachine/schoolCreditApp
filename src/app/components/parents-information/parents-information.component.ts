import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { Parent, ParentRegistration } from "src/app/models/data-models";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { pluck } from "rxjs/operators";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-parents-information",
  templateUrl: "./parents-information.component.html",
  styleUrls: ["./parents-information.component.css"]
})
export class ParentsInformationComponent implements OnInit {
  view:
    | ""
    | "profile-form"
    | "work-form"
    | "picture"
    | "phone"
    | "email"
    | "verification"
    | "email"
    | "confirm-email"
    | "enter-code"
    | "four-digit-pin"
    | "choose-verification" = "";
  spinner: boolean = false;
  selected: "email" | "phone" | "" = "";
  type: "1" | "2" | "" = "";
  parent: Partial<Parent> = {};
  phoneForm: FormGroup;
  phoneVerificationForm: FormGroup;
  PINForm: FormGroup
  emailForm: FormGroup;
  constructor(
    private generalservice: GeneralService,
    private store: Store<fromStore.AllState>,
    private fb: FormBuilder,
    private chatapi: ChatService
  ) {}

  ngOnInit(): void {
    this.store
      .pipe(pluck("manageParent", "parent_info"))
      .subscribe((val: Parent & Object) => {
        console.log(val);
        if (
          val.hasOwnProperty("phone") &&
          val.hasOwnProperty("OTP_sent") &&
          !val.OTP_sent
        ) {
          this.sendParentInformationToServer(val);
        }
      });

    this.phoneForm = this.fb.group({
      phone: ["", Validators.required]
    });
    this.phoneVerificationForm = this.fb.group({
      OTP: ["", Validators.required]
    });

    this.emailForm = this.fb.group({
      email: ["", Validators.required]
    });

    this.PINForm = this.fb.group({
      pin: ["", Validators.required]
    });
  }

  submitPhoneForm(form: FormGroup) {
    this.spinner = true;
    let parentDetails: Partial<Parent> = form.value;
    this.store.dispatch(new generalActions.addParents(parentDetails));
    // this.changeToStuff();
  }

  sendParentInformationToServer(obj: Partial<ParentRegistration>) {
    this.chatapi.registerParent(obj).subscribe(
      async val => {
        const { guardian, data } = val;
        let newState: Partial<Parent> = { guardian };
        try {
          const res = await this.chatapi.dispatchOTP({ phone: data.phone });
          const refreshedState: Partial<Parent> = { OTP_sent: true };
          this.store.dispatch(new generalActions.addParents(refreshedState));
          this.spinner = false;
          this.changeToAnotherView();
        } catch (error) {
          console.log(error);
          this.spinner = false;
        }

        this.store.dispatch(new generalActions.addParents(newState));
      },
      err => {
        console.log(err);
        this.spinner = false;
      }
    );
  }

  changeThisToProfile(event: Event) {
    const pa =
      event.target instanceof HTMLImageElement
        ? event.target.nextElementSibling
        : (event.target as HTMLDivElement).querySelector(".bolded");
    switch (pa.textContent.toLowerCase()) {
      case "parent":
        this.type = "1";
        this.parent.type = this.type;
        this.store.dispatch(new generalActions.addParents(this.parent));
        break;
      case "guardian":
        this.type = "2";
        this.parent.type = this.type;
        this.store.dispatch(new generalActions.addParents(this.parent));
        break;
    }
    this.view = "profile-form";
    // ;
  }

  saveParentInfo(form: FormGroup) {
    this.spinner = true;
    let guardian
    const responseFromParent = new replyGiversOrReceivers(
      `I have provided my details`,
      "right"
    );

    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Thank you for registering, Femi Bejide`,
      "left",
      "",
     ``
    );
    const disconnect: Subscription = this.store
      .pipe(pluck("manageParent", "parent_info", "guardian"))
      .subscribe(val => (guardian = val));
     this.chatapi.saveParentPIN({pin: form.value.pin, guardian}).subscribe(val =>{
          this.generalservice.responseDisplayNotifier(responseFromParent);
          this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
          // this.generalservice.setStage("parent-info", {});
          let ParentPin: Partial<Parent> = { pin: form.value.pin }
          this.store.dispatch(new generalActions.addParents(ParentPin));
          setTimeout(() => {
            this.generalservice.handleFlowController("");
            this.spinner = false;
            this.generalservice.nextChatbotReplyToGiver = undefined;
            this.spinner = false;
            disconnect.unsubscribe();
            const chatbotResponse = new replyGiversOrReceivers(
              `How would you like to pay?`,
              "left",
              "Instalmental payments, Full Payment",
              `installmental,fullpayment`,
              "prevent"
            );
            this.generalservice.responseDisplayNotifier(chatbotResponse);
          }, 600);
     }, err => console.log(err))

    
   
  }

  changeToAnotherView() {
    let something;
    if (this.selected == "") {
      this.view = "verification";
      something = "phone";
    }
    if (this.selected == "phone") {
      this.view = "email";
      something = "email";
    }
    if (this.selected == "email") {
      this.view = "picture";
      something = "";
    }

    this.selected = something;
  }

  async confirmVerification(form: FormGroup) {
    this.spinner = true;
    let guardian;
    //  i need to write selectors to stop doing this
    const disconnect: Subscription = this.store
      .pipe(pluck("manageParent", "parent_info", "guardian"))
      .subscribe(val => (guardian = val));

    try {
      const { message } = await this.chatapi.verifyOTP({
        phone_OTP: form.value.OTP,
        guardian
      });
      if (message.toLowerCase() == "phone number has been validated!") {
        this.spinner = false;
        disconnect.unsubscribe();
        this.changeToAnotherView();
      }
    } catch (error) {
      this.spinner = false;
    }
  }

  async submitEmail(form: FormGroup) {
    this.spinner = true;
    let guardian;
    //  i need to write selectors to stop doing this
    const disconnect: Subscription = this.store
      .pipe(pluck("manageParent", "parent_info", "guardian"))
      .subscribe(val => (guardian = val));

    try {
      await this.chatapi.updateEmail({
        email: form.value.email,
        guardian
      });
      const refreshedState: Partial<Parent> = { email: form.value.email };
      this.store.dispatch(new generalActions.addParents(refreshedState));
      this.spinner = false;

      disconnect.unsubscribe();
      this.changeToAnotherView();
    } catch (error) {
      this.spinner = false;
    }
  }

  change(event) {
    this.spinner = false;
    this.view = "four-digit-pin";
  }
}
