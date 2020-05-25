import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { HttpClient } from "@angular/common/http";
import { forkJoin } from "rxjs";
import { timeout } from "rxjs/operators";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-evidence-upload",
  templateUrl: "./evidence-upload.component.html",
  styleUrls: ["./evidence-upload.component.css"]
})
export class EvidenceUploadComponent implements OnInit {
  public evidencesBackUpArray = [];
  public currentEvidenceToUpload = [];
  public arrayOfEvidencesToSendToNebechi: any[] = [];
  public nameOfCurrentFamily: string;
  public transactionID: string;
  public familyName: string;
  public familyID: string;
  public giverID: string;
  public uploadNextFamily: boolean = false;
  public uploadCompleted: boolean = false;

  //  i will delete this later;
  mOBTRIEWF = [];
  //

  public pictureContainer: File;
  public previousFamily = [];
  public count: number = 0;
  public countOfUploadsLeft: number;
  notification = { show: false, message: undefined };
  constructor(
    private generalservice: GeneralService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.thoroughlyCheckForPaidField();
    this.evidencesBackUpArray = [
      ...this.generalservice.noOfevidencesOfTransferToUpload
    ];
    this.countOfUploadsLeft = this.evidencesBackUpArray.length;
    this.dissectCurrentEvidence();
    // console.log(JSON.parse(sessionStorage.getItem("evidenceUploadData")));
  }

  dissectCurrentEvidence() {
    if (this.generalservice.noOfevidencesOfTransferToUpload.length < 1) {
      return;
    } else {
      this.currentEvidenceToUpload = this.generalservice.noOfevidencesOfTransferToUpload[
        this.count
      ];
      let currentEvidenceToUpload = this.currentEvidenceToUpload;
      // clear all variables
      this.transactionID = "";
      this.familyID = "";
      this.familyName = "";
      this.giverID = "";

      // start assigning stuff to them;
      this.transactionID = Object.keys(currentEvidenceToUpload)[0];
      // console.log(this.transactionID);
      const str: string = currentEvidenceToUpload[this.transactionID];
      const temp: string[] = str.split("-");
      this.familyName = temp[2];
      this.familyID = temp[0];
      this.giverID = temp[1];
      this.generalservice.noOfevidencesOfTransferToUpload.splice(0, 1);
    }
  }

  mimeController(event) {
    if (event.target.files[0].size > 2000000) {
      this.generalservice.controlGlobalNotificationSubject.next("off");
      this.notification.show = true;
      this.notification.message =
        "Please upload images less than 2mb. Thank you";
      this.removeNotification();
      return;
      // return this.generalservice.handleFlowController("receiverBankAccount");
    }
    this.pictureContainer = event.target.files[0];
    this.arrangeObjectToSend();
    this.uploadNextFamily = true;
    if (this.generalservice.noOfevidencesOfTransferToUpload.length == 0) {
      this.uploadCompleted = true;
      this.uploadNextFamily = false;
    }
    this.countOfUploadsLeft--;
    this.dissectCurrentEvidence();

    // this.generalservice.familyImage = event.target.files[0];
    // console.log(this.generalservice.familyImage);
    const imageToDisplay = document.getElementById(
      "imageToDisplay"
    ) as HTMLImageElement;

    // console.log(event.target.files);
    let reader: FileReader;
    if (FileReader) {
      // check if the filereader api is supported by browser

      reader = new FileReader();
      reader.onload = event => {
        imageToDisplay.src = `${event.target["result"]}`;
        // this.generalservice.familyImageToConfirm = event.target["result"];
        // this.uploaded = true;
      };
      reader.readAsDataURL(event.target.files[0]);
      // this.controlAnimation();
      // const giverResponse = new replyGiversOrReceivers(
      //   `I have uploaded picture evidence of the transfer i made to ${this.familyName}`,
      //   "right"
      // );

      // this.generalservice.handleFlowController(giverResponse);
    }
  }

  trigger(str?: string) {
    if (str) {
      // clear the current picture;
      const imageToDisplay = document.getElementById(
        "imageToDisplay"
      ) as HTMLImageElement;
      imageToDisplay.src = "";
      // this next part is done so that the upload button comes back;
      this.uploadNextFamily = false;
      return;
    }
    (document.getElementById("inputFile") as HTMLInputElement).click();
  }

  //  this function will be used later!
  changePicture() {
    this.generalservice.noOfevidencesOfTransferToUpload = [
      ...this.evidencesBackUpArray
    ];
    this.uploadCompleted = false;
    this.uploadNextFamily = false;
    this.countOfUploadsLeft = this.evidencesBackUpArray.length--;
    this.dissectCurrentEvidence();
  }

  arrangeObjectToSend() {
    const transactionID = this.extractTransactionData(this.familyID);
    this.transactionID = transactionID;
    let sendToBackend = new FormData();
    sendToBackend.append("transaction_id", this.transactionID);
    sendToBackend.append("receiver_id", this.familyID);
    sendToBackend.append("giver_id", this.giverID);
    sendToBackend.append("transfer_image", this.pictureContainer);
    let myOwnBackToBeRemovedIfEverythingWorksFine = {
      transaction_id: this.transactionID,
      receiver_id: this.familyID,
      giver_id: this.giverID,
      file: this.pictureContainer
    };
    this.mOBTRIEWF = [];
    this.mOBTRIEWF.push(myOwnBackToBeRemovedIfEverythingWorksFine);
    this.arrayOfEvidencesToSendToNebechi.push(sendToBackend);
  }

  sendUploadToNebechi() {
    // console.log(this.arrayOfEvidencesToSendToNebechi);
    this.generalservice.controlGlobalNotificationSubject.next("on");
    let arrayOfHttpRequests = [];
    this.arrayOfEvidencesToSendToNebechi.forEach(stuffToSend => {
      arrayOfHttpRequests.push(
        this.http.post(
          `${this.generalservice.apiUrl}uploadpayment`,
          stuffToSend
        )
      );
    });

    forkJoin(...arrayOfHttpRequests)
      .pipe(timeout(60000))
      .subscribe(
        (val: Array<any>) => {
          this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
            "allow"
          );

          let giverResponse = new replyGiversOrReceivers(
            `I have uploaded picture evidence of all the transfers I did.`,
            "right"
          );

          setTimeout(() => {
            const nl: NodeList = document.querySelectorAll(".dynamicButton");
            this.generalservice.specialCaseButtons(nl, "disable");
            this.generalservice.nextChatbotReplyToGiver = null;
            this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
              `Thank you so much for uploading evidence of your transfers. If you want to give some more, please click the buttons below`,
              "left",
              "Give more money",
              "giveMoney"
            );
            this.generalservice.responseDisplayNotifier(giverResponse);
            
          }, 500);
          //  just for backup
          this.generalservice.justFinishedGiving = true;
          //
          (document.querySelector(".modal-close") as HTMLSpanElement).click();
          this.generalservice.controlGlobalNotificationSubject.next("off");
            this.generalservice.familiesForCashDonation = [];
            this.generalservice.familiesSelectedWithTransactionID = [];
            this.generalservice.familiesForSelection = [];
        },
        err => console.log(err)
      );
  }

  thoroughlyCheckForPaidField() {
    let temp = [];
    temp = this.generalservice.noOfevidencesOfTransferToUpload.filter(
      (element: Object) => {
        // checking that element['paid] == true is the same as just element['paid]
        return element.hasOwnProperty("paid") && element["paid"] == true;
      }
    );
    this.generalservice.noOfevidencesOfTransferToUpload = [];
    this.generalservice.noOfevidencesOfTransferToUpload = [...temp];
  }

  removeNotification() {
    setTimeout(() => {
      this.notification.show = false;
      this.notification.message = undefined;
    }, 4000);
  }

  extractTransactionData(id: string | number): string {
    return this.generalservice.familiesSelectedWithTransactionID.find(
      element => element.id == id
    )["transaction_id"];
  }
}
