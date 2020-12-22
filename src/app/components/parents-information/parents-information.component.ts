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

  saveParentInfo() {
    this.spinner = true;

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

    this.generalservice.responseDisplayNotifier(responseFromParent);
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    this.generalservice.setStage("parent-info", {});
    setTimeout(() => {
      this.generalservice.handleFlowController("");
      this.spinner = false;
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
}
