import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
// declare var $: any;

@Component({
  selector: "app-terms-and-condition",
  templateUrl: "./terms-and-condition.component.html",
  styleUrls: ["./terms-and-condition.component.css"]
})
export class TermsAndConditionComponent implements OnInit {
  checkBox: boolean = false;
  smallAlert: boolean = false;
  constructor(private generalservice: GeneralService) {}

  ngOnInit() {}

  setCheckBoxState(e) {
    this.checkBox = e.srcElement.checked;
    // console.log(this.checkBox);
  }
  startByAskingForBvn() {
    // console.log("i am here", this.checkBox);
    if (!this.checkBox) {
      this.smallAlert = true;
      setTimeout(() => {
        this.smallAlert = false;
      }, 2500);
      return;
    } else {
      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      // this.generalservice.responseDisplayNotifier("termsAndConditionAccepted");
    }
  }
}
