import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GeneralService } from "src/app/services/generalService/general.service";

@Component({
  selector: "app-giver-component",
  templateUrl: "./giver-component.component.html",
  styleUrls: ["./giver-component.component.css"]
})

export class GiverComponentComponent implements OnInit {
  name: string;
  constructor(private generalservice: GeneralService, private router: Router) {

  }

  ngOnInit(): void {
    sessionStorage.removeItem("userLatLng");
    // this.generalservice.nextChatbotReplyToGiver = null;
    // console.log(this.router.url.split('/'));
    const userNameOfSchool = this.router.url.split('/').length > 2 ?  this.router.url.split('/').slice(-1)[0] : undefined;
    this.name = userNameOfSchool;
  }
}
