import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-parent-account-form",
  templateUrl: "./parent-account-form.component.html",
  styleUrls: ["./parent-account-form.component.css"]
})
export class ParentAccountFormComponent implements OnInit {
  page: "" | "PIN" | "attach-card" | "info" = "";
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {}

  completeThis() {
    const responseFromParent = new replyGiversOrReceivers(
      `I have entered my account information.`,
      "right"
    );
    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Congrats, Your offer letter is ready. it will be sent to your eail: femiapps@gmail.com`,
      "left",
      "",
      ``
    );

    this.generalservice.responseDisplayNotifier(responseFromParent);
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    this.generalservice.handleFlowController("");
    this.generalservice.setStage("account-info", {});
    setTimeout(() => {
      this.generalservice.nextChatbotReplyToGiver = undefined;
      const chatbotResponse = new replyGiversOrReceivers(
        `If you need further assistance on this service Chat with us here?`,
        "left",
        "chat",
        "",
        "prevent"
      );
      this.generalservice.responseDisplayNotifier(chatbotResponse);
    }, 800);
  }
}
