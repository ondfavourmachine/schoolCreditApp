import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GeneralService } from "src/app/services/generalService/general.service";

@Component({
  selector: "app-giver-component",
  templateUrl: "./giver-component.component.html",
  styleUrls: ["./giver-component.component.css"]
})

export class GiverComponentComponent implements OnInit {
  name: string;
  constructor(private generalservice: GeneralService, private activatedRoute: ActivatedRoute) {

  }

  ngOnInit(): void {
    sessionStorage.removeItem("userLatLng");
    // this.generalservice.nextChatbotReplyToGiver = null;
    this.activatedRoute.queryParams.subscribe((map: {name: string, token: string}) => this.name = map.name)
  }
}
