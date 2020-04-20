import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { ReceiversResponse, GiverResponse, replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-transparency-disclaimer",
  templateUrl: "./transparency-disclaimer.component.html",
  styleUrls: ["./transparency-disclaimer.component.css"]
})
export class TransparencyDisclaimerComponent implements OnInit {
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {}

  userAcceptedOrNot(e: Event) {
    const input = e.srcElement as HTMLInputElement;
    if (input.checked) {
      const response: ReceiversResponse = new ReceiversResponse(
        this.generalservice.typeOfPerson,
        "kyc",
        {
          message: "I have accepted the terms and condition",
          direction: "right",
          button: "",
          extraInfo: undefined
        }
      );
      //  const message: replyGiversOrReceivers = {message:'testing', button'right',}
      // const response1: GiverResponse = new GiverResponse()
      this.generalservice.controlGlobalNotificationSubject.next("on");
      this.generalservice.responseDisplayNotifier(response);
      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");

      // after 3 seconds let the modal display the know your receiver component
      setTimeout(() => {
        this.generalservice.handleFlowController("knowYourReceiver"),
          this.generalservice.communicationForKYC({
            nextStage: "fpw",
            previousStage: null
          });
      }, 1500);
    }
  }
}
