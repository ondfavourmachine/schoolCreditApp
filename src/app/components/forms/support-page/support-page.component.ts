import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { debounceTime } from "rxjs/operators";
import { GeneralService } from "src/app/services/generalService/general.service";

@Component({
  selector: "app-support-page",
  templateUrl: "./support-page.component.html",
  styleUrls: ["./support-page.component.css"]
})
export class SupportPageComponent implements OnInit {
  stage: string; // 1 2 3 or 4
  supportPageForm: FormGroup;
  public familyDetails = {};
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
      giver_id: "1",
      amount_given: String(this.supportPageForm.get("amount").value)
        .split(",")
        .join(""),
      item_given: "1"
    };
    this.http
      .post(`${this.generalservice.apiUrl}transaction`, formToSubmit)
      .subscribe(
        val => {
          this.familyDetails = { ...val };
        },
        err => console.log(err)
      );
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
