import { Component, OnInit, AfterViewInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { timeout } from "rxjs/operators";
import { TimeoutError } from "rxjs";
// import { registerLocaleData } from '@angular/common';

@Component({
  selector: "app-confirm-details-uploaded",
  templateUrl: "./confirm-details-uploaded.component.html",
  styleUrls: ["./confirm-details-uploaded.component.css"]
})
export class ConfirmDetailsUploadedComponent implements OnInit, AfterViewInit {
  submit: string = "confirm";

  constructor(
    private generalservice: GeneralService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.generalservice.controlGlobalNotificationSubject.next("off");
    }, 1000);
  }

  ngAfterViewInit() {
    this.displayImageForUserToConfirm();
  }

  displayImageForUserToConfirm() {
    const imageToDisplay = document.getElementById(
      "imageToDisplay"
    ) as HTMLImageElement;
    // let reader: FileReader;
    // if (FileReader) {
    // check if the filereader api is supported by browser
    imageToDisplay.src = this.generalservice.familyImageToConfirm;

    // reader = new FileReader();
    // reader.onload = event => {
    // this.generalservice.familyImageToConfirm = event.target["result"];
    // };
    // reader.readAsDataURL(this.generalservice.familyImage);
    // this.controlAnimation();
    // }
  }

  submitRequestForAssistance() {
    this.generalservice.controlGlobalNotificationSubject.next("on");
    // setTimeout(() => {
    //   // this.submit = "failed";
    //   this.generalservice.switchOfModal = true;
    //   this.generalservice.controlGlobalNotificationSubject.next("off");
    // }, 2500);
    this.sendToNebechi();
  }

  sendToNebechi() {
    const userLatLng = JSON.parse(sessionStorage.getItem("userLatLng")) || {};
    const currentState = JSON.parse(sessionStorage.getItem("currentState"));
    console.log(currentState);
    const bankCodeSelected = sessionStorage.getItem("bankCodeSelected");
    const accountNumber = sessionStorage.getItem("account_number");
    const accountDetails = JSON.parse(sessionStorage.getItem("accountDetails"));

    let dataToSend = new FormData();
    dataToSend.append("family_name", currentState["nameOfPerson"]);
    dataToSend.append("phone", currentState["phoneNumber"]);
    dataToSend.append("breadwinner_job", currentState["occupation"]);
    // if(size) this.familyDetailsInfo.sizeOfFamily = size;
    dataToSend.append("members_no", currentState["sizeOfFamily"]);
    dataToSend.append(
      "member_type",
      this.generateCodeForSubmission(currentState.spouse)
    );
    dataToSend.append("location", "1");
    dataToSend.append("identity_no", currentState["idOfParentValue"]);
    dataToSend.append("member_identity_no", currentState["idOfSpouseValue"]);
    dataToSend.append(
      "identity_type",
      this.identificationConfig(currentState.idOfParentToProvide)
    );
    dataToSend.append("family_picture", this.generalservice.familyImage);
    dataToSend.append(
      "member_identity_type",
      this.identificationConfig(currentState.idOfSpouseToProvide)
    );
    dataToSend.append("account_bank", bankCodeSelected);
    dataToSend.append("account_no", accountNumber);
    dataToSend.append("account_name", accountDetails.data.account_name);
    dataToSend.append("latitude", userLatLng["latitude"]);
    dataToSend.append("longitude", userLatLng["longitude"]);
    dataToSend.append(
      "type",
      this.generateCodeForSubmission(currentState.parent)
    );
    this.http
      .post(`${this.generalservice.apiUrl}receiver`, dataToSend)
      .pipe(timeout(60000))
      .subscribe(
        val => {
          if (!val["status"]) {
            this.generalservice.controlGlobalNotificationSubject.next("off");
            this.submit = "failed";
            setTimeout(() => {
              sessionStorage.clear();
              this.closeTheModal("cancel");
              this.generalservice.switchOfModal = true;
            }, 3000);
            return;
          }
          this.generalservice.controlGlobalNotificationSubject.next("off");
          this.generalservice.switchOfModal = true;
          this.submit = "success";
          sessionStorage.clear();
          this.closeTheModal("success");
          // setTimeout(() => {
          //   (document.querySelector(".modal-close") as HTMLSpanElement).click();
          // }, 2000);
        },
        (err: HttpErrorResponse | TimeoutError) => {
          if (err instanceof TimeoutError) {
            console.log(err);
            this.generalservice.controlGlobalNotificationSubject.next("off");
            this.closeTheModal("cancel");
          }
          if (err instanceof HttpErrorResponse && err.status == 500) {
            this.generalservice.controlGlobalNotificationSubject.next("off");
            this.submit = "failed";
            sessionStorage.clear();
          }
          if (err instanceof HttpErrorResponse && err.status == 400) {
            this.generalservice.controlGlobalNotificationSubject.next("off");
            setTimeout(() => {
              this.closeTheModal("cancel");
            }, 1500);
            this.submit = "failed";
            sessionStorage.clear();
          }
        }
      );
  }

  generateCodeForSubmission(value?: string) {
    if (!value) return;
    if (
      value.toString().toLowerCase() == "husband" ||
      value.toString().toLowerCase() == "father"
    ) {
      return "1";
    } else if (
      value.toString().toLowerCase() == "wife" ||
      value.toString().toLowerCase() == "mother"
    ) {
      return "2";
    } else if (value.toString().toLowerCase() == "son") {
      return "3";
    } else if (value.toString().toLowerCase() == "daughter") {
      return "4";
    }
  }

  identificationConfig(val: string) {
    let regex = /drivers/i;
    if (!val) return;
    if (val.toString().toLowerCase() == "national id") {
      return "1";
    } else if (val.toString().toLowerCase() == "voters id") {
      return "3";
    } else if (val.toString().toLowerCase() == "international passport") {
      return "2";
    } else if (regex.test(val)) {
      return "4";
    }
  }

  closeTheModal(command?: string) {
    console.log("Closing modal!", command);
    if (!command) return;
    if (command == "success") {
      (document.querySelector(".modal-close") as HTMLSpanElement).click();
      this.generalservice.notifyThatCongratsOrRegrets("success");
    } else {
      (document.querySelector(".modal-close") as HTMLSpanElement).click();
      this.generalservice.notifyThatCongratsOrRegrets("cancelled");
    }
  }
}
