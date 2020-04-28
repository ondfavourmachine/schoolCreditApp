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
  amount: string;
  text: string;
  families = [];

  public familyDetails: {
    family_name?: string;
    bank_name?: string;
    account_no?: string;
  } = {};

  constructor(
    private fb: FormBuilder,
    private generalservice: GeneralService,
    private http: HttpClient
  ) { }

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

  submitAmount(event: Event) {
    this.amount = (event.srcElement as HTMLParagraphElement).textContent
      .toString()
      .split(",")
      .join("")
      .substring(1);
    // console.log(this.amount);
    if (this.amount == "5000") {
      this.text = "";
      this.text = "a family in need who can be helped with at least N5000";
    }
    if (this.amount == "10000") {
      this.text = "";
      this.text = "2 families in need who can be helped with at least N5000 each.";
    }
    if (this.amount == "20000") {
      this.text = "";
      this.text = "4 families in need who can be helped with at least N5000 each.";
    }
    if (this.amount == "50000") {
      this.text = "";
      this.text = "10 families in need who can be helped with at least N5000 each.";
    }
    this.stage = "1";
  }

  getFamily() {
    if (!this.amount) return;
    this.stage = "2";
    const formToSubmit = {
      giver_id: sessionStorage.getItem("giver"),
      amount_given: this.amount,
      item_given: "1"
    };
    // this.tryAgain();
    setTimeout(() => {
      this.fetchFamilies(formToSubmit);
    }, 500);
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  gotoFamilyDetails() {
    this.generalservice.handleFlowController("foundBeneficiary");
  }

  getFamilyToSubmit() {
    // this.familyDetails = FamilyToSupport().data;
  }

  tryAgain() {
    this.http
      .post(`${this.generalservice.apiUrl}zeroallselected`, {})
      .subscribe();
  }

  fetchFamilies(formToSubmit) {
    this.http
      .post(`${this.generalservice.apiUrl}transaction`, formToSubmit)
      .subscribe(
        res => {
          if (!res["status"]) {
            this.stage = "0";
          } else {
            // let temp = [];
            // if (res["data"].length == 1) {
            //   for (let data of res["data"]) {
            //     this.familyDetails = { ...data };
            //   }
            // } else {

            this.generalservice.familiesForCashDonation = res["data"];
            this.families = res["data"];
            this.stage = '4';


            // console.log(this.familyDetails);
            // this.generalservice.familyToReceiveCashDonation = this.familyDetails;
            // console.log(this.generalservice.familyToReceiveCashDonation);
            // console.log(this.generalservice.familiesForCashDonation);
            // this.stage = "3";
          }
        },
        err => console.log(err)
      );
  }

  gotoFamily() {
    this.generalservice.controlGlobalNotificationSubject.next("on");
    this.gotoFamilyDetails();
  }
}
