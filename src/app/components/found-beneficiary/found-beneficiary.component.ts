import { Component, OnInit, AfterViewInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-found-beneficiary",
  templateUrl: "./found-beneficiary.component.html",
  styleUrls: ["./found-beneficiary.component.css"]
})
export class FoundBeneficiaryComponent implements OnInit, AfterViewInit {
  stage: string = "1"; // 1, 2, 3, 4, 5
  familyThatWillBenefit: any = {};
  familyPictureToDisplay: string;
  constructor(public generalservice: GeneralService) {
    console.log(this.generalservice.familyToReceiveCashDonation);
    console.log(this.generalservice.familiesForCashDonation);
    this.familyThatWillBenefit = generalservice.familyToReceiveCashDonation;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.generalservice.controlGlobalNotificationSubject.next("off");
    }, 500);
    console.log("i am here");
  }

  ngAfterViewInit() {
    //
    // this.generalservice.familyToReceiveCashDonation?.family_picture
    (document.getElementById(
      "familyPicture"
    ) as HTMLImageElement).src = this.generalservice.familyToReceiveCashDonation.family_picture;
  }

  checkEligibilty() {
    this.stage = "3";
  }

  iHaveTransferredTheMoney() {
    if (this.generalservice.familiesForCashDonation.length != 0) {
      this.familyThatWillBenefit = "";
      this.familyThatWillBenefit = this.generalservice.familiesForCashDonation.splice(
        0,
        1
      );
      console.log(this.familyThatWillBenefit);
      let imageElement = document.getElementById(
        "familyPicture"
      ) as HTMLImageElement;
      imageElement.src = "";
      imageElement.src = this.familyThatWillBenefit[0].family_picture;
      this.stage = "1";
      return;
    }
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
