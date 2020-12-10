import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

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
    | "result" = "";
  selected: string;
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {}

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
      `An offer letter is sent to your email.`,
      "left"
    );
    // this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
    //   `Summary :
    //    You entered a total of ₦${new Intl.NumberFormat().format(total)}
    //    Number of Children: ${this.mapOfChildrensInfo.size}`,
    //   "left",
    //   "",
    //   ``
    // );

    this.generalservice.responseDisplayNotifier(responseFromParent);
  }
}
