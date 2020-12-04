import { Component, OnInit, AfterViewInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { HttpClient } from "@angular/common/http";
// import { last } from 'rxjs/operators';

@Component({
  selector: "app-found-beneficiary",
  templateUrl: "./found-beneficiary.component.html",
  styleUrls: ["./found-beneficiary.component.css"]
})
export class FoundBeneficiaryComponent implements OnInit, AfterViewInit {
  stage: string = "1"; // 1, 2, 3, 4, 5
  familyThatWillBenefit: any = {};
  familyPictureToDisplay: string;
  selectedIndex: number = 0;
  currentFamilyToShow: any;
  public paidFamilies: any[] = [];
  public continueAllowingPictureScroll: boolean = true;
  public showPopUpWarning: boolean = false;
  public isTransformed: boolean = false;
  public loading: boolean = false;
  public confirmed: boolean = true;
  private previousFamilyThatReceivedHelp: string;
  private giverID = sessionStorage.getItem("giver");
  notification = { show: false, message: undefined };
  constructor(public generalservice: GeneralService, private http: HttpClient) {
    this.currentFamilyToShow = this.generalservice.familiesForSelection[
      this.selectedIndex
    ];
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.generalservice.controlGlobalNotificationSubject.next("off");
    }, 500);
    // console.log(this.confirmed);
  }

  ngAfterViewInit() {
    // console.log(this.familyThatWillBenefit);
    // const { family_picture } = this.familyThatWillBenefit;
    // const { family_picture } = this.currentFamilyToShow;
    // // console.log('Family picture..', family_picture);
    // (document.getElementById("familyPicture") as HTMLImageElement).src =
    //   family_picture || "/assets/images/family-avatar.png";
    this.insertPicture();
  }

  checkEligibilty() {
    this.stage = "3";
  }

  next() {
    if (!this.isGiverAllowedToSeeMorePictures(this.selectedIndex)) {
      return;
    } else {
      this.showPopUpWarning = false;
      this.continueAllowingPictureScroll = true;
      this.fetchMoreReceivers();
    }
    this.selectedIndex++;
    this.currentFamilyToShow = this.generalservice.familiesForSelection[
      this.selectedIndex
    ];
    this.insertPicture();
  }

  prev() {
    if (!this.continueAllowingPictureScroll) {
      this.continueAllowingPictureScroll = !this.continueAllowingPictureScroll;
    }
    this.selectedIndex--;
    this.currentFamilyToShow = this.generalservice.familiesForSelection[
      this.selectedIndex
    ];
    this.insertPicture();
  }

  iHaveTransferredTheMoney() {
    this.confirmed = true;
    if (this.generalservice.familiesForCashDonation.length != 0) {
      this.previousFamilyThatReceivedHelp = this.currentFamilyToShow;
      this.currentFamilyToShow = "";

      let temp = this.generalservice.familiesForCashDonation.splice(0, 1);
      this.currentFamilyToShow = temp[0];
      // console.log(this.currentFamilyToShow);
      let imageElement = document.getElementById(
        "familyPicture"
      ) as HTMLImageElement;
      imageElement.src = "";
      imageElement.src =
        this.currentFamilyToShow.family_picture ||
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
          `${this.previousFamilyThatReceivedHelp["phone"]}-${this.previousFamilyThatReceivedHelp["id"]}-${this.giverID}-${this.previousFamilyThatReceivedHelp["family_name"]}`
        );
        this.generalservice.responseDisplayNotifier(giverResponse);
        this.generalservice.noOfevidencesOfTransferToUpload.push({
          [this.previousFamilyThatReceivedHelp[
            "phone"
          ]]: `${this.previousFamilyThatReceivedHelp["id"]}-${this.giverID}-${this.previousFamilyThatReceivedHelp["family_name"]}`,
          paid: true
        });
      }, 300);
      this.stage = "1";
      // return;
    }
  }

  iConfirmThatMoneyHasLeftMyAccount() {
    let index: number, nextNumber: number, temp, temp2;
    // console.log(this.currentFamilyToShow);
    index = this.generalservice.familiesForSelection.findIndex(
      family => family.id == this.currentFamilyToShow.id
    );
    // console.log(index);
    temp2 = this.generalservice.familiesForSelection[index];
    this.paidFamilies.push(temp2);
    // console.log(this.paidFamilies);
    this.generalservice.familiesForSelection.splice(index, 1);
    const formToSubmit = {};
    formToSubmit["id"] = this.currentFamilyToShow["id"];
    formToSubmit["transaction_id"] = this.currentFamilyToShow["transaction_id"];
    nextNumber = this.selectedIndex;
    nextNumber =
      nextNumber == this.generalservice.familiesForSelection.length - 1
        ? this.generateRandomNumber()
        : nextNumber;
    temp = this.generalservice.familiesForSelection[nextNumber + 1];
    this.generalservice.familiesForCashDonation.push(temp);
    // console.log(formToSubmit);
    // this.http
    //   .post(`${this.generalservice.apiUrl}paid`, formToSubmit)
    //   .subscribe();
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

  pushDown(event: Event) {
    const el = document.getElementById("targetParent") as HTMLElement;
    const img = document.getElementById("familyPicture") as HTMLImageElement;
    img.style.height = "90%";
    el.style.transform = "translateY(100px)";
    this.isTransformed = !this.isTransformed;
  }

  pushUp(event: Event) {
    const el = document.getElementById("targetParent") as HTMLElement;
    const img = document.getElementById("familyPicture") as HTMLImageElement;
    el.style.transform = "translateY(0)";
    img.style.height = "80%";
    this.isTransformed = !this.isTransformed;
  }

  insertPicture(): void {
    try {
      const { family_picture } = this.currentFamilyToShow;
      (document.getElementById("familyPicture") as HTMLImageElement).src =
        family_picture || "/assets/images/family-avatar.png";
    } catch (e) {
      // console.log(e);
      const family_picture = "/assets/images/family-avatar.png";
      (document.getElementById(
        "familyPicture"
      ) as HTMLImageElement).src = family_picture;
      this.currentFamilyToShow = {};
      this.currentFamilyToShow["family_name"] =
        "Please wait while we load more families";
    }
  }

  isGiverAllowedToSeeMorePictures(selectedIndex: number): boolean {
    if (
      selectedIndex == this.generalservice.familiesForSelection.length - 1 &&
      this.paidFamilies.length == 0
    ) {
      this.showPopUpWarning = true;
      this.continueAllowingPictureScroll = false;
      return false;
    }
    return true;
  }

  generateRandomNumber(): number {
    return Math.round(Math.random() * 9 - 1);
  }

  // this function is clicked when the user is done with all transfers
  userIsDoneTransferring() {
    this.generalservice.controlGlobalNotificationSubject.next("on");
    const giverResponse = new replyGiversOrReceivers(
      `I have transferred N5000 to the ${this.currentFamilyToShow["family_name"]}`,
      "right"
    );

    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Thank you so much for providing help in this trying times. God bless you. Please take a moment to upload some evidence of transfer to ${this.currentFamilyToShow["family_name"]}`,
      "left",
      "Upload evidence",
      `${this.currentFamilyToShow["phone"]}-${this.currentFamilyToShow["id"]}-${this.giverID}-${this.currentFamilyToShow["family_name"]}`
    );
    this.sendPaidFamiliesToBackend();
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    // (document.querySelector(".modal-close") as HTMLSpanElement).click();
    this.generalservice.responseDisplayNotifier(giverResponse);
    this.generalservice.controlGlobalNotificationSubject.next("off");
    this.generalservice.noOfevidencesOfTransferToUpload.push({
      [this.currentFamilyToShow[
        "phone"
      ]]: `${this.currentFamilyToShow["id"]}-${this.giverID}-${this.currentFamilyToShow["family_name"]}`,
      paid: true
    });
    this.generalservice.handleFlowController("evidenceUploadComponent");
    this.generalservice.justFinishedGiving = true;
  }

  sendPaidFamiliesToBackend() {
    const giver_id = sessionStorage.getItem("giver");
    const selected_receivers = this.paidFamilies;
    this.http
      .post(`${this.generalservice.apiUrl}selectedreceivers`, {
        giver_id,
        selected_receivers
      })
      .subscribe(
        val =>
          (this.generalservice.familiesSelectedWithTransactionID = [
            ...val["data"]
          ]),
        err => console.log(err)
      );
  }

  async fetchMoreReceivers() {
    let ids: Array<any> = [],
      count: number = 0,
      temp = [],
      lastIndex: number;
    if (
      this.paidFamilies.length < 1 &&
      this.selectedIndex < this.generalservice.familiesForSelection.length - 1
    ) {
      return;
    } else if (
      this.paidFamilies.length >= 1 &&
      this.selectedIndex >= this.generalservice.familiesForSelection.length - 1
    ) {
      this.loading = true;
      this.generalservice.familiesForSelection.forEach(family => {
        ids.push(family.id);
      });
      try {
        const res = await this.http
          .post(`${this.generalservice.apiUrl}tenreceivers`, {
            families_sent_already: ids
          })
          .toPromise();
        const temp = res["data"];
        // console.log(this.generalservice.familiesForSelection);
        lastIndex = this.generalservice.familiesForSelection.length;
        // console.log(lastIndex, this.selectedIndex);
        this.selectedIndex = lastIndex + 1;
        // console.log(this.selectedIndex);
        this.generalservice.familiesForSelection = this.generalservice.familiesForSelection.concat(
          temp
        );
        this.currentFamilyToShow = this.generalservice.familiesForSelection[
          this.selectedIndex
        ];
        this.insertPicture();
        this.loading = false;
      } catch (e) {
        console.log(e);
      }
    }
  }
}
