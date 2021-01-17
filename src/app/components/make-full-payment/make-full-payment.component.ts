import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-make-full-payment",
  templateUrl: "./make-full-payment.component.html",
  styleUrls: ["./make-full-payment.component.css"]
})
export class MakeFullPaymentComponent implements OnInit {
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {}

  doneSendingMoney() {
    const responseFromParent = new replyGiversOrReceivers(
      `I have made payments to account provided.`,
      "right"
    );

    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Thank you for making payment. Please take a screen shot of your transfer for evidence`,
      "left",
      "",
      ``
    );

    this.generalservice.responseDisplayNotifier(responseFromParent);
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    setTimeout(() => {
      this.generalservice.handleFlowController("");
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `Thank you for using this service.`,
        "left",
        "",
        ``,
        "prevent"
      );

      const chatbotResponse = new replyGiversOrReceivers(
        `Adanma High School will send you a confirmation email, once they receive payment.`,
        "left",
        "",
        ``,
        "prevent"
      );
      this.generalservice.responseDisplayNotifier(chatbotResponse);
      sessionStorage.removeItem('savedChats');
    }, 800);
  }
}
