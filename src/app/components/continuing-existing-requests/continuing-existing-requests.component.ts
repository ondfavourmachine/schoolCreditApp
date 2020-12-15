import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-continuing-existing-requests",
  templateUrl: "./continuing-existing-requests.component.html",
  styleUrls: ["./continuing-existing-requests.component.css"]
})
export class ContinuingExistingRequestsComponent implements OnInit {
  view: "" | "four-digit-pin" = "";
  arrayOfNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11];
  input: string = "";
  response: replyGiversOrReceivers = undefined;
  nextStage: string;
  overlay: boolean = false;
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {
    this.generalservice.nextStageForUser$.subscribe(
      val => (this.nextStage = val)
    );
  }

  checking() {
    this.overlay = true;

    document.querySelector(".checking").classList.add("working");
    setTimeout(() => {
      document.querySelector(".checking").classList.remove("working");
      this.overlay = false;
      this.view = "four-digit-pin";
    }, 1500);
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

  continue() {
    switch (this.nextStage) {
      case "bank-form":
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
          this.generalservice.responseDisplayNotifier(chatbotResponse);
        }, 800);
        break;
    }
  }
}
