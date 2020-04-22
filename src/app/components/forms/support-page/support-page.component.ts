import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { debounceTime } from "rxjs/operators";
import { GeneralService } from "src/app/services/generalService/general.service";
import { FamilyToSupport } from "../../../models/familyToSupport";

@Component({
  selector: "app-support-page",
  templateUrl: "./support-page.component.html",
  styleUrls: ["./support-page.component.css"]
})
export class SupportPageComponent implements OnInit {
  stage: string; // 1 2 3 or 4
  supportPageForm: FormGroup;
  notification = { show: false, message: undefined };
  public familyDetails: {
    family_name?: string;
    bank_name?: string;
    account_no?: string;
  } = {};
  constructor(
    private fb: FormBuilder,
    private generalservice: GeneralService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.supportPageForm = this.fb.group({
      amount: ["", Validators.required]
    });
    this.supportPageForm
      .get("amount")
      .valueChanges.pipe(debounceTime(500))
      .subscribe(val => {
        this.supportPageForm
          .get("amount")
          .patchValue(this.numberWithCommas(String(val)));
      });
    // this.getFamilyToSubmit()
  }

  submit() {
    console.log(this.supportPageForm.value);
    if (this.supportPageForm.value["amount"].length < 5) {
      return;
    }
    this.stage = "1";
  }

  getFamily() {
    console.log(this.supportPageForm.value["amount"]);
    this.stage = "2";
    const formToSubmit = {
      giver_id: sessionStorage.getItem("giver"),
      amount_given: String(this.supportPageForm.get("amount").value)
        .split(",")
        .join(""),
      item_given: "1"
    };
    this.http
      .post(`${this.generalservice.apiUrl}transaction`, formToSubmit)
      .subscribe(
        val => {
          if (
            val["message"] ==
              "No Family Available to receive your Kindness! Please Try Giving in the Next Hour." &&
            !val["status"]
          ) {
            this.tryAgain();
          } else {
            for (let data of val["data"]) {
              this.familyDetails = { ...data };
            }
            // console.log(this.familyDetails);
            this.generalservice.familyToReceiveCashDonation = this.familyDetails;
            console.log(this.generalservice.familyToReceiveCashDonation);
            this.stage = "3";
          }
        },
        err => console.log(err)
      );
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  gotoFamilyDetails() {
    this.generalservice.controlGlobalNotificationSubject.next("on");
    this.generalservice.handleFlowController("foundBeneficiary");
  }

  getFamilyToSubmit() {
    // this.familyDetails = FamilyToSupport().data;
  }

  tryAgain() {
    this.http
      .post(`${this.generalservice.apiUrl}zeroallselected `, {})
      .subscribe(
        val => {
          for (let data of val["data"]) {
            this.familyDetails = { ...data };
          }
          console.log(this.familyDetails);
          this.generalservice.familyToReceiveCashDonation = this.familyDetails;
          this.stage = "3";
        },
        err => {
          this.stage = "";
          this.notification.show = true;
          this.notification.message =
            "Could not get families at this time. Please try again later";
          setTimeout(() => {
            this.notification.show = false;
            this.notification.message = undefined;
          }, 2500);
        }
      );
  }
}
