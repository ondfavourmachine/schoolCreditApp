import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";

@Component({
  selector: "app-giver-component",
  templateUrl: "./giver-component.component.html",
  styleUrls: ["./giver-component.component.css"]
})
export class GiverComponentComponent implements OnInit {
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {
    sessionStorage.removeItem("userLatLng");
    // this.generalservice.nextChatbotReplyToGiver = null;
  }
}
