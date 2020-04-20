import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";

@Component({
  selector: "app-bank-details",
  templateUrl: "./bank-details.component.html",
  styleUrls: ["./bank-details.component.css"]
})
export class BankDetailsComponent implements OnInit {
  constructor(private generalservice: GeneralService) {}

  ngOnInit(): void {}
}
