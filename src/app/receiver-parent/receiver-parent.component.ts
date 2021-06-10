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
   
  }
}
