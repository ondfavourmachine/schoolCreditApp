import { Component, OnInit } from "@angular/core";
import { GeneralService } from "../services/generalService/general.service";

@Component({
  selector: "app-receiver-parent",
  templateUrl: "./receiver-parent.component.html",
  styleUrls: ["./receiver-parent.component.css"]
})
export class ReceiverParentComponent implements OnInit {
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {
    // this.generalservice.handleFlowController("welcomeModal");
    // sessionStorage.removeItem("userLatLng");
    // if (sessionStorage.getItem("route")) sessionStorage.removeItem("route");
    // if (sessionStorage.getItem("giver")) sessionStorage.removeItem("giver");
    // this.generalservice.noOfevidencesOfTransferToUpload = [];
    // this.generalservice.nextChatbotReplyToGiver = null;
    // this.generalservice.uploadEvidenceOfTransferInProgress = false;
    // this.generalservice.justFinishedGiving = false;
  }
}
