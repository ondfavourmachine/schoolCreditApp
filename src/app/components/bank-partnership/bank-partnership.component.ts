import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import {
  ChatService,
  FinancialInstitution
} from "src/app/services/ChatService/chat.service";

@Component({
  selector: "app-bank-partnership",
  templateUrl: "./bank-partnership.component.html",
  styleUrls: ["./bank-partnership.component.css"]
})
export class BankPartnershipComponent implements OnInit {
  page:
    | ""
    | "bvn"
    | "valid-id"
    | "bank-details"
    | "checking"
    | "enter-id"
    | "result"
    | "work-form"
    | "address-info"
    | "preambleToForms" = "checking";
  selected: string;
  result: object & FinancialInstitution = undefined;
  constructor(
    private generalservice: GeneralService,
    private chatservice: ChatService
  ) {}

  ngOnInit(): void {
    this.chatservice.getFinancialInstitution().subscribe(val => {
      // console.log(val);
      this.result = val;
      this.page = "";
    });
  }

  selectThis(event) {
    const p =
      event.target instanceof HTMLImageElement
        ? event.target.nextElementSibling
        : (event.target as HTMLElement).querySelector(".bolded");

    // debugger;
    this.selected = p.textContent.trim();
  }

  accepted() {
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    this.generalservice.handleFlowController("");
    this.generalservice.nextChatbotReplyToGiver = undefined;
    const responseFromParent = new replyGiversOrReceivers(
      `Thanks for this information. RexCredit is preparing your final offer`,
      "left",
      "",
      "prevent"
    );

    this.generalservice.responseDisplayNotifier(responseFromParent);
    this.generalservice.setStage("bank-form", {});
    setTimeout(() => {
      this.generalservice.nextChatbotReplyToGiver = undefined;
      const chatbotResponse = new replyGiversOrReceivers(
        `They will also like to know which Which account will we be debiting you from?`,
        "left",
        "Add Account",
        `addaccount`,
        "prevent"
      );
      this.generalservice.responseDisplayNotifier(chatbotResponse);
    }, 800);
  }
}
