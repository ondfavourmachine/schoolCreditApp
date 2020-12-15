import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

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
    | "email"
    | "confirm-email"
    | "enter-code"
    | "four-digit-pin"
    | "choose-verification" = "";
  spinner: boolean = false;
  selected: "email" | "phone" | "" = "";
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {}

  changeThisToProfile() {
    this.view = "profile-form";
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
}
