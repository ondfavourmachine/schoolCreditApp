import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ReceiversResponse } from "src/app/models/GiverResponse";
import { pipe, TimeoutError } from "rxjs";
import { timeout } from "rxjs/operators";

interface Bank {
  id: string;
  bank_code: string;
  name: string;
}

interface BankAccountCheckResponse {
  account_number: string;
  account_name: string;
  bank_id?: string;
}
@Component({
  selector: "app-receiver-bank-account",
  templateUrl: "./receiver-bank-account.component.html",
  styleUrls: ["./receiver-bank-account.component.css"]
})
export class ReceiverBankAccountComponent implements OnInit {
  bankForm: FormGroup;
  bank_code = "058";
  account_number = "0046329069";
  banks: Array<Bank> = [];
  notification = { show: false, message: undefined };
  public displayAccountDetails: BankAccountCheckResponse;
  public selectedBank: string;
  public accountCheck: string;

  constructor(
    private generalservice: GeneralService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.fetchBankName();
    this.getLocationFromIp();
  }

  ngOnInit(): void {
    this.bankForm = this.fb.group({
      bank_name: ["", Validators.required],
      account_no: ["", [Validators.required]]
    });
    setTimeout(() => {
      this.generalservice.controlGlobalNotificationSubject.next("off");
    }, 1000);

    // this.bankForm.get('account_no').valueChanges
  }

  takeOffAccountDetails() {
    (document.querySelector(
      ".accountDetailsSearchResult"
    ) as HTMLDivElement).style.display = "none";
  }

  showAccountDetails() {
    (document.querySelector(
      ".accountDetailsSearchResult"
    ) as HTMLDivElement).style.display = "flex";
  }
  controlAnimation() {
    const div = document.querySelector(
      ".accountDetailsSearchResult"
    ) as HTMLDivElement;
    if (div.classList.contains("animationIn")) {
      div.classList.remove("animationIn");
      div.classList.add("animationOut");
      // div.style.display = 'flex !important'
    } else {
      div.classList.remove("animationOut");
      div.classList.add("animationIn");
    }
  }

  get bankName() {
    return this.bankForm.get("bank_name");
  }

  get accountNumber() {
    return this.bankForm.get("account_no");
  }

  public bankNameIsRequired() {
    return this.bankName.hasError("required") && this.bankName.touched;
  }

  // public accountNumberIsRequired() {
  //   return (
  //     this.accountNumber.hasError("minLength") && this.accountNumber.touched
  //   );
  // }

  fetchBankName() {
    let allBanks = JSON.parse(sessionStorage.getItem("allBanks"));
    if (sessionStorage.getItem("allBanks")) {
      this.banks = allBanks["data"] as Array<Bank>;
      // console.log(this.banks);
      return;
    }
    let url = "https://mobile.creditclan.com/webapi/v1/banks";
    let httpHeaders = new HttpHeaders({
      "x-api-key": "z2BhpgFNUA99G8hZiFNv77mHDYcTlecgjybqDACv"
    });
    this.http.get(url, { headers: httpHeaders }).subscribe(
      val => {
        this.banks = [...val["data"]];
        // console.log(this.banks);
        sessionStorage.setItem("allBanks", JSON.stringify(val));
      },
      err => console.log(err)
    );
  }

  submitForm() {
    // console.log(this.bankForm.value);
    if (this.bankForm.value["account_no"].length != 10) {
      this.notification.show = true;
      this.notification.message = "Please enter a 10 digit account number!";
      setTimeout(() => {
        this.notification.show = false;
        this.notification.message = undefined;
      }, 2000);
    } else {
      this.generalservice.controlGlobalNotificationSubject.next("on");
      // let accountDetails = JSON.parse(sessionStorage.getItem("accountDetails"));
      sessionStorage.setItem("bankCodeSelected", this.bankName.value);
      sessionStorage.setItem("account_number", this.accountNumber.value);
      this.getAccountDetails();
      // console.log(accountDetails.account_name);
      // sessionStorage.setItem("account_name", accountDetails.account_name);
    }
  }

  getAccountDetails() {
    let url = "https://mobile.creditclan.com/webapi/v1/account/resolve";
    let obj = {
      account_number: this.bankForm.value["account_no"],
      bank_code: this.bankForm.value["bank_name"]
    };
    let httpHeaders = new HttpHeaders({
      "x-api-key": "z2BhpgFNUA99G8hZiFNv77mHDYcTlecgjybqDACv"
    });
    this.http
      .post(url, obj, { headers: httpHeaders })
      .pipe(timeout(50000))
      .subscribe(
        val => {
          if (!val["status"]) {
            this.accountCheck = "failed";
            this.generalservice.controlGlobalNotificationSubject.next("off");
            this.controlAnimation();
            this.showAccountDetails();
            return;
          }
          this.accountCheck = "successful";
          sessionStorage.setItem("accountDetails", JSON.stringify(val));
          sessionStorage.setItem("bankCodeSelected", this.bankName.value);
          sessionStorage.setItem("account_number", this.accountNumber.value);
          sessionStorage.setItem("account_name", val["data"].account_name);
          this.displayAccountDetails = val["data"];
          this.controlAnimation();
          this.showAccountDetails();
          this.generalservice.controlGlobalNotificationSubject.next("off");
        },
        err => {
          if (err instanceof TimeoutError) {
            this.notification.show = true;
            this.notification.message =
              "Please check your internet connection and try again";
            setTimeout(() => {
              this.notification.show = false;
              this.notification.message = undefined;
            }, 2500);
            this.generalservice.controlGlobalNotificationSubject.next("off");
          } else {
            this.notification.show = true;
            this.notification.message =
              "Something went wrong. Try submitting again or try again later.";
            setTimeout(() => {
              this.notification.show = false;
              this.notification.message = undefined;
            }, 2500);
            this.generalservice.controlGlobalNotificationSubject.next("off");
          }
        }
      );
  }

  setBankName(name: Event) {
    // console.log(name);
    this.selectedBank = (name.srcElement as HTMLSelectElement).selectedOptions[0].text;
  }

  moveToNextStage() {
    const response: ReceiversResponse = new ReceiversResponse(
      this.generalservice.typeOfPerson,
      "",
      {
        message: "I have provided by bank account Information",
        direction: "right",
        button: "",
        extraInfo: undefined
      }
    );
    this.generalservice.controlGlobalNotificationSubject.next("on");
    this.generalservice.responseDisplayNotifier(response);
    setTimeout(() => {
      this.generalservice.handleFlowController("confirmDetailsUploaded");
    }, 1200);
  }

  async getLocationFromIp() {
    try {
      const { longitude, latitude } = await (await fetch(
        "https://api.ipstack.com/check?access_key=2f2fdee3320b5dcebf5b167167dd96f2"
      )).json();
      this.generalservice.location = { latitude, longitude };
      // sessionStorage.userLatLng = this.generalservice.location;
      // this.verifyLocation(this.location);
    } catch (error) {
      console.log("Location error.. ", error);
    }
  }

  tryAgain() {
    this.takeOffAccountDetails();
    this.accountCheck = "";
    this.bankForm.reset();
  }
}
