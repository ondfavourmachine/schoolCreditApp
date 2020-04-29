import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { GeneralService } from "../../../services/generalService/general.service";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { timeout } from "rxjs/operators";
import { TimeoutError } from "rxjs";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-identify-or-anonymous",
  templateUrl: "./identify-or-anonymous.component.html",
  styleUrls: ["./identify-or-anonymous.component.css"]
})
export class IdentifyOrAnonymousComponent implements OnInit {
  public iAForm: FormGroup;
  stayAnonymous: string;
  notification = { show: false, message: undefined };
  termsVisible = false;

  constructor(
    private fb: FormBuilder,
    private generalservice: GeneralService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.showTerms();
    if (sessionStorage.getItem("giver")) {
      this.generalservice.handleFlowController("supportPageForms");
    }
    this.iAForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", Validators.required],
      phone: ["", Validators.required],
      gender: ["1"],
      tAndC: [true, Validators.required]
    });
    let stayAnonymous = sessionStorage.getItem("anonymous");
    stayAnonymous == "1"
      ? (this.stayAnonymous = "1")
      : (this.stayAnonymous = "2");
    // console.log(typeof this.stayAnonymous);
  }

  submit(form: FormGroup) {
    this.generalservice.controlGlobalNotificationSubject.next("on");
    let formToSubmit = { ...form.value };
    formToSubmit["anonymous"] = sessionStorage.getItem("anonymous");
    // console.log(formToSubmit);
    this.http
      .post(`${this.generalservice.apiUrl}giver`, formToSubmit)
      .pipe(timeout(50000))
      .subscribe(
        val => {
          sessionStorage.setItem("giver", val["giver"]);
          let giverResponse: replyGiversOrReceivers;
          if (this.stayAnonymous == "1") {
            giverResponse = new replyGiversOrReceivers(
              "Please keep me anonymous",
              "right"
            );
          } else {
            giverResponse = new replyGiversOrReceivers(
              "I have provided my details",
              "right"
            );
          }
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            "What Would you like to give. Money or items",
            "left",
            "Money,Food Stuff",
            "giveMoney,giveFood"
          );
          this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
            "allow"
          );
          (document.querySelector(".modal-close") as HTMLSpanElement).click();
          this.generalservice.responseDisplayNotifier(giverResponse);
          this.generalservice.controlGlobalNotificationSubject.next("off");
        },
        err => {
          if (err instanceof TimeoutError) {
            this.generalservice.controlGlobalNotificationSubject.next("off");
            this.notification.show = true;
            this.notification.message =
              "it seems you have a poor internet connection. Please check it and try again";
            this.removeNotification();
          }
          if (err instanceof HttpErrorResponse && err.status == 500) {
            this.generalservice.controlGlobalNotificationSubject.next("off");
            this.notification.show = true;
            this.notification.message =
              "Oops, something went wrong. Please try again later.";
            this.removeNotification();
          } else {
            this.generalservice.controlGlobalNotificationSubject.next("off");
            this.notification.show = true;
            this.notification.message =
              "You seem to have omitted some values. Please check it and try again";
            this.removeNotification();
          }
        }
      );
    // this.generalservice.responseDisplayNotifier({
    //   reply: {
    //     message: "What Would you like to give. Money or Food items",
    //     direction: "left",
    //     button: "money,items",
    //     extraInfo: "money,items"
    //   }
    // });
  }

  get name() {
    return this.iAForm.get("name");
  }

  get email() {
    return this.iAForm.get("email");
  }
  get gender() {
    return this.iAForm.get("gender");
  }
  get phone() {
    return this.iAForm.get("phone");
  }

  public nameIsRequired() {
    return this.name.hasError("required") && this.name.touched;
  }

  public phoneIsRequired() {
    return this.phone.hasError("required") && this.phone.touched;
  }
  public emailIsRequired() {
    return this.email.hasError("required") && this.email.touched;
  }

  removeNotification() {
    setTimeout(() => {
      this.notification.show = false;
      this.notification.message = undefined;
    }, 2000);
  }

  showTerms() {
    this.termsVisible = true;
  }

  hideTerms() {
    this.termsVisible = false;
  }
}
