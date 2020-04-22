import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-found-beneficiary",
  templateUrl: "./found-beneficiary.component.html",
  styleUrls: ["./found-beneficiary.component.css"]
})
export class FoundBeneficiaryComponent implements OnInit {
  stage: string = "1"; // 1, 2, 3, 4, 5
  familyThatWillBenefit: any = {};
  constructor(public generalservice: GeneralService) {
    console.log(this.generalservice.familyToReceiveCashDonation);
    this.familyThatWillBenefit = generalservice.familyToReceiveCashDonation;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.generalservice.controlGlobalNotificationSubject.next("off");
    }, 1500);
  }

  checkEligibilty() {
    this.stage = "3";
  }

  iHaveTransferredTheMoney() {
    this.generalservice.controlGlobalNotificationSubject.next("on");
    const giverResponse = new replyGiversOrReceivers(
      "I have transferred the money",
      "right"
    );

    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      "Thank you for providing help in this trying times. God bless you",
      "left"
    );
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    (document.querySelector(".modal-close") as HTMLSpanElement).click();
    this.generalservice.responseDisplayNotifier(giverResponse);
    this.generalservice.controlGlobalNotificationSubject.next("off");
  }
}
