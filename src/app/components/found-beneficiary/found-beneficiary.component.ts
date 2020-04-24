import { Component, OnInit, AfterViewInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-found-beneficiary",
  templateUrl: "./found-beneficiary.component.html",
  styleUrls: ["./found-beneficiary.component.css"]
})
export class FoundBeneficiaryComponent implements OnInit, AfterViewInit {
  stage: string = "1"; // 1, 2, 3, 4, 5
  familyThatWillBenefit: any = {};
  familyPictureToDisplay: string;
  notification = { show: false, message: undefined };
  constructor(public generalservice: GeneralService, private http: HttpClient) {
    // console.log(this.generalservice.familyToReceiveCashDonation);
    // console.log(this.generalservice.familiesForCashDonation);
    this.familyThatWillBenefit = generalservice.familiesForCashDonation.splice(
      0,
      1
    )[0];
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.generalservice.controlGlobalNotificationSubject.next("off");
    }, 500);
    // console.log("i am here");
  }

  ngAfterViewInit() {
    // console.log(this.familyThatWillBenefit);
    (document.getElementById(
      "familyPicture"
    ) as HTMLImageElement).src = this.familyThatWillBenefit.family_picture;
  }

  checkEligibilty() {
    this.stage = "3";
  }

  iHaveTransferredTheMoney() {
    if (this.generalservice.familiesForCashDonation.length != 0) {
      let previousFamily = this.familyThatWillBenefit;
      this.familyThatWillBenefit = "";
      let temp = this.generalservice.familiesForCashDonation.splice(0, 1);
      this.familyThatWillBenefit = temp[0];
      // console.log(this.familyThatWillBenefit);
      let imageElement = document.getElementById(
        "familyPicture"
      ) as HTMLImageElement;
      imageElement.src = "";
      imageElement.src = this.familyThatWillBenefit.family_picture;
      const giverResponse = new replyGiversOrReceivers(
        `I have transferred N5000 to the ${previousFamily["family_name"]}`,
        "right"
      );
      setTimeout(() => {
        this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
          "Thank you so much. God bless you",
          "left"
        );
        this.generalservice.responseDisplayNotifier(giverResponse);
      }, 300);
      this.stage = "1";
      return;
    }
    this.generalservice.controlGlobalNotificationSubject.next("on");
    const giverResponse = new replyGiversOrReceivers(
      "I have transferred money to all of them",
      "right"
    );

    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      "Thank you so much for providing help in this trying times. God bless you.",
      "left"
    );
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    (document.querySelector(".modal-close") as HTMLSpanElement).click();
    this.generalservice.responseDisplayNotifier(giverResponse);
    this.generalservice.controlGlobalNotificationSubject.next("off");
  }

  iConfirmThatMoneyHasLeftMyAccount() {
    // console.log(this.familyThatWillBenefit);
    const formToSubmit = {};
    formToSubmit["id"] = this.familyThatWillBenefit["id"];
    formToSubmit["transaction_id"] = this.familyThatWillBenefit[
      "transaction_id"
    ];
    this.http
      .post(`${this.generalservice.apiUrl}paid`, formToSubmit)
      .subscribe();
  }
  // stage = '5'
  checkThatUserHasTransferredMoney() {
    const checked = (document.getElementById(
      "confirmTransfer"
    ) as HTMLInputElement).checked;
    // console.log(checked);
    if (checked) {
      this.stage = "5";
      this.iConfirmThatMoneyHasLeftMyAccount();
      return;
    } else {
      this.notification.show = true;
      this.notification.message =
        "You have to confirm that you have sent the money by clicking the checkbox";
      setTimeout(() => {
        this.notification.show = false;
        this.notification.message = undefined;
      }, 4000);
    }
  }
}
