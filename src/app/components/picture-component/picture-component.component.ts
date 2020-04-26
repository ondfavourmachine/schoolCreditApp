import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import {
  ReceiversResponse,
  replyGiversOrReceivers
} from "src/app/models/GiverResponse";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-picture-component",
  templateUrl: "./picture-component.component.html",
  styleUrls: ["./picture-component.component.css"]
})
export class PictureComponentComponent implements OnInit {
  // @ViewChild("ImageInsertionPoint") ImageInsertionPoint: ElementRef;
  public notification: boolean;
  file: File;
  uploaded = false;
  uploadEvidence = false;
  public familyName: string = "";
  public transferEvidence: File;
  public idontWantToProvidePictures: boolean = false;

  constructor(
    private generalservice: GeneralService,
    private http: HttpClient
  ) {
    if (generalservice.noOfevidencesOfTransferToUpload) {
      this.uploadEvidence = generalservice.uploadEvidenceOfTransferInProgress
        ? true
        : false;
      const arr = JSON.parse(sessionStorage.getItem("evidenceUploadData"));
      this.familyName = this.getFamilyName(arr[0]);
    }
  }

  ngOnInit(): void {
    this.generalservice.controlGlobalNotificationSubject.next("off");
  }

  mimeController(event) {
    // check the file the user is trying to upload is
    // more than 2.5mb. If it is, tell d user;

    if (event.target.files[0].size > 2500000) {
      this.notification = true;
      setTimeout(() => {
        this.notification = false;
      }, 2500);
      return;
    }

    if (this.familyName) {
      // console.log(event.target.files[0]);
      this.loadImage(event);
      return;
    }
    this.generalservice.familyImage = event.target.files[0];
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
        this.generalservice.familyImageToConfirm = event.target["result"];
        this.uploaded = true;
      };
      reader.readAsDataURL(event.target.files[0]);
      // this.controlAnimation();
    }
  }

  trigger() {
    // console.log("i am here");
    (document.getElementById("inputFile") as HTMLInputElement).click();
  }

  // controlAnimation() {
  //   const div = document.querySelector(
  //     ".translateCoverPlate"
  //   ) as HTMLDivElement;
  //   if (div.classList.contains("animationIn")) {
  //     div.classList.remove("animationIn");
  //     div.classList.add("animationOut");
  //     // div.style.display = 'flex !important'
  //   } else {
  //     div.classList.remove("animationOut");
  //     div.classList.add("animationIn");
  //   }
  // }

  changePicture() {
    // this.controlAnimation();
    const imageToDisplay = document.getElementById(
      "imageToDisplay"
    ) as HTMLImageElement;
    imageToDisplay.src = "";
    this.uploaded = false;
  }

  next() {
    // let currentState = JSON.parse(sessionStorage.getItem("currentState"));

    // currentState.imageOfFamily = this.file;
    // sessionStorage.setItem("currentState", JSON.stringify(currentState));
    const response: ReceiversResponse = new ReceiversResponse(
      this.generalservice.typeOfPerson,
      "takeAPicture",
      {
        message: "I have uploaded my family picture",
        direction: "right",
        button: "",
        extraInfo: undefined
      }
    );
    this.generalservice.controlGlobalNotificationSubject.next("on");
    this.generalservice.responseDisplayNotifier(response);
    // setTimeout(() => {
    // }, 1200);
    this.generalservice.handleFlowController("receiverBankAccount");
  }

  getFamilyName(obj: Object): string {
    for (let key in obj) {
      let str = obj[key].split("/")[2];
      return str;
    }
  }

  loadImage(event) {
    const imageToDisplay = document.getElementById(
      "imageToDisplay"
    ) as HTMLImageElement;
    this.transferEvidence = event.target.files[0];
    let reader: FileReader;
    if (FileReader) {
      // check if the filereader api is supported by browser

      reader = new FileReader();
      reader.onload = event => {
        imageToDisplay.src = `${event.target["result"]}`;
        this.generalservice.familyImageToConfirm = event.target["result"];
        this.uploaded = true;
      };
      reader.readAsDataURL(event.target.files[0]);
      // this.controlAnimation();
    }
  }
  uploadEvidenceOfTransfer() {
    const arr = JSON.parse(sessionStorage.getItem("evidenceUploadData"))[0];
    console.log(this.transferEvidence);
    const transaction_id = Object.keys(arr)[0];
    let receiver_id, giver_id;
    for (let key in arr) {
      receiver_id = arr[key].split("/")[0];
      giver_id = arr[key].split("/")[1];
    }

    const formToSubmit = new FormData();
    formToSubmit.append("transaction_id", transaction_id);
    formToSubmit.append("receiver_id", receiver_id);
    formToSubmit.append("giver_id", giver_id);
    formToSubmit.append("transfer_image", this.transferEvidence);
    this.generalservice.controlGlobalNotificationSubject.next("on");
    console.log(this.generalservice.noOfevidencesOfTransferToUpload);
    this.http
      .post(`${this.generalservice.apiUrl}uploadpayment`, formToSubmit)
      .subscribe(
        val => {
          if (val["status"]) {
            const giverResponse = new replyGiversOrReceivers(
              `I have uploaded picture evidence of the transfer i made to ${this.familyName}`,
              "right"
            );

            const button = document.querySelector(
              `[data-button*="${this.familyName}"]`
            ) as HTMLButtonElement;
            button.classList.add("disabled");
            button.disabled = true;
            button.style.pointerEvents = "none";
            (document.querySelector(".modal-close") as HTMLSpanElement).click();
            this.generalservice.noOfevidencesOfTransferToUpload--;

            this.generalservice.controlGlobalNotificationSubject.next("off");
            if (!this.generalservice.noOfevidencesOfTransferToUpload) {
              setTimeout(() => {
                this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
                  `Thank you so much for confirming your transfers. If you want to give some more, please click the buttons below`,
                  "left",
                  "Give more money",
                  "giveMoney"
                );
                this.generalservice.responseDisplayNotifier(giverResponse);
                sessionStorage.removeItem("evidenceUploadData");
              }, 300);
            }
          }
        },
        err => console.log(err)
      );
  }

  noPicturesProvided() {
    this.uploaded = true;
    this.idontWantToProvidePictures = true;
    (document.querySelector(".noPictures") as HTMLElement).style.display =
      "none";
    (document.querySelector(".noPictures") as HTMLElement).style.zIndex = "-1";
    (document.getElementById(
      "idontWantToProvidePictures"
    ) as HTMLElement).style.height = "550px";
    // const response: ReceiversResponse = new ReceiversResponse(
    //   this.generalservice.typeOfPerson,
    //   "takeAPicture",
    //   {
    //     message: "I didnt provide any pictures because i do not have any.",
    //     direction: "right",
    //     button: "",
    //     extraInfo: undefined
    //   }
    // );
    // this.generalservice.controlGlobalNotificationSubject.next("on");
    // this.generalservice.responseDisplayNotifier(response);
    // // setTimeout(() => {
    // // }, 1200);
    // this.generalservice.handleFlowController("receiverBankAccount");
  }

  hide() {
    this.uploaded = false;
    this.idontWantToProvidePictures = false;
    (document.querySelector(".noPictures") as HTMLElement).style.display =
      "block";
    (document.querySelector(".noPictures") as HTMLElement).style.zIndex =
      "1000";
    (document.getElementById(
      "idontWantToProvidePictures"
    ) as HTMLElement).style.height = "auto";
  }
}
