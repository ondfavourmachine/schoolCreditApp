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
  public confirmed: boolean = true;
  private previousFamilyThatReceivedHelp: string;
  private giverID = sessionStorage.getItem("giver");
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
    // console.log(this.confirmed);
  }

  ngAfterViewInit() {
    // console.log(this.familyThatWillBenefit);
    const { family_picture } = this.familyThatWillBenefit;
    // console.log('Family picture..', family_picture);
    (document.getElementById("familyPicture") as HTMLImageElement).src =
      family_picture || "/assets/images/family-avatar.png";
  }

  checkEligibilty() {
    this.stage = "3";
  }

  iHaveTransferredTheMoney() {
    this.confirmed = true;
    if (this.generalservice.familiesForCashDonation.length != 0) {
      this.previousFamilyThatReceivedHelp = this.familyThatWillBenefit;
      this.familyThatWillBenefit = "";

      let temp = this.generalservice.familiesForCashDonation.splice(0, 1);
      this.familyThatWillBenefit = temp[0];
      // console.log(this.familyThatWillBenefit);
      let imageElement = document.getElementById(
        "familyPicture"
      ) as HTMLImageElement;
      imageElement.src = "";
      imageElement.src =
        this.familyThatWillBenefit.family_picture ||
        "/assets/images/family-avatar.png";
      const giverResponse = new replyGiversOrReceivers(
        `I have transferred N5000 to the ${this.previousFamilyThatReceivedHelp["family_name"]}`,
        "right"
      );

      setTimeout(() => {
        this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
          `Thank you so much. God bless you. Please could you take a moment to upload some evidence of transfer
            to ${this.previousFamilyThatReceivedHelp["family_name"]}`,
          "left",
          "Upload evidence",
          `${this.previousFamilyThatReceivedHelp["transaction_id"]}-${this.previousFamilyThatReceivedHelp["id"]}-${this.giverID}-${this.familyThatWillBenefit["family_name"]}`
        );
        this.generalservice.responseDisplayNotifier(giverResponse);
        this.generalservice.noOfevidencesOfTransferToUpload.push({
          [this.previousFamilyThatReceivedHelp[
            "transaction_id"
          ]]: `${this.previousFamilyThatReceivedHelp["id"]}-${this.giverID}-${this.previousFamilyThatReceivedHelp["family_name"]}`
        });
      }, 300);
      this.stage = "1";
      return;
    }

    this.generalservice.controlGlobalNotificationSubject.next("on");
    const giverResponse = new replyGiversOrReceivers(
      `I have transferred N5000 to the ${this.familyThatWillBenefit["family_name"]}`,
      "right"
    );

    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Thank you so much for providing help in this trying times. God bless you. Please take a moment to upload some evidence of transfer to ${this.familyThatWillBenefit["family_name"]}`,
      "left",
      "Upload evidence",
      `${this.familyThatWillBenefit["transaction_id"]}-${this.familyThatWillBenefit["id"]}-${this.giverID}-${this.familyThatWillBenefit["family_name"]}`
    );
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    // (document.querySelector(".modal-close") as HTMLSpanElement).click();
    this.generalservice.responseDisplayNotifier(giverResponse);
    this.generalservice.controlGlobalNotificationSubject.next("off");
    this.generalservice.noOfevidencesOfTransferToUpload.push({
      [this.familyThatWillBenefit[
        "transaction_id"
      ]]: `${this.familyThatWillBenefit["id"]}-${this.giverID}-${this.familyThatWillBenefit["family_name"]}`
    });
    this.generalservice.handleFlowController("evidenceUploadComponent");
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
      }, 10000);
    }
  }
}
