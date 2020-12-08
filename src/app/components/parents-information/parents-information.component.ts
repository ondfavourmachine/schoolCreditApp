import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-parents-information",
  templateUrl: "./parents-information.component.html",
  styleUrls: ["./parents-information.component.css"]
})
export class ParentsInformationComponent implements OnInit {
  view:
    | ""
    | "profile-form"
    | "work-form"
    | "picture"
    | "email"
    | "confirm-email"
    | "enter-code" = "";
  spinner: boolean = false;
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {}

  addPicture() {
    document.getElementById("picture-upload").click();
  }

  changeThisToProfile() {
    this.view = "profile-form";
  }

  loadImage(event: Event) {
    let reader: FileReader;
    if (FileReader) {
      // check if the filereader api is supported by browser

      reader = new FileReader();
      reader.onload = anevent => {
        (document.querySelector(
          ".modified-img"
        ) as HTMLImageElement).src = `${anevent.target["result"]}`;
      };
      reader.readAsDataURL(event.target["files"][0]);
      // this.controlAnimation();
    }
  }

  saveParentInfo() {
    this.spinner = true;

    const responseFromParent = new replyGiversOrReceivers(
      `I have entered my profile, work information and have confirmed my email`,
      "right"
    );
    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Thank you for providing us with your data`,
      "left",
      "Edit",
      ``
    );

    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    this.generalservice.responseDisplayNotifier(responseFromParent);
    setTimeout(() => {
      this.generalservice.handleFlowController("");
      this.spinner = false;
      this.generalservice.nextChatbotReplyToGiver = undefined;
      const chatbotResponse = new replyGiversOrReceivers(
        `We have partnered with banks who will like to finance this transaction`,
        "left",
        "Start",
        ``,
        "prevent"
      );
      this.generalservice.responseDisplayNotifier(chatbotResponse);
    }, 800);
  }
}
