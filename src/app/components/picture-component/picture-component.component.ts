import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { ReceiversResponse } from "src/app/models/GiverResponse";

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

  constructor(private generalservice: GeneralService) { }

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
}
