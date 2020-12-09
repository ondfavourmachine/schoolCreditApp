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
    | "enter-code" = "";
  spinner: boolean = false;
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {}

  changeThisToProfile() {
    this.view = "profile-form";
  }

  saveParentInfo() {
    this.spinner = true;

    const responseFromParent = new replyGiversOrReceivers(
      `I have entered my profile, work information and have confirmed my email`,
      "right"
    );
    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Thank you for providing us with your data. Would you like to modify?`,
      "left",
      "Yes edit, No let's continue",
      `edit,cancel`
    );

    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    this.generalservice.responseDisplayNotifier(responseFromParent);
    setTimeout(() => {
      this.generalservice.handleFlowController("");
      this.spinner = false;
      // this.generalservice.nextChatbotReplyToGiver = undefined;
      // const chatbotResponse = new replyGiversOrReceivers(
      //   `We have partnered with banks who will like to finance this transaction`,
      //   "left",
      //   "Start",
      //   ``,
      //   "prevent"
      // );
      // this.generalservice.responseDisplayNotifier(chatbotResponse);
    }, 800);
  }
}
