import { Component, OnInit, OnDestroy } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { ChatService } from "src/app/services/ChatService/chat.service";
import {
  Bank,
  Parent,
  ParentAccountInfo,
  CompleteParentInfomation,
  ParentCreditCardInfo
} from "src/app/models/data-models";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { Subscription } from "rxjs";

@Component({
  selector: "app-parent-account-form",
  templateUrl: "./parent-account-form.component.html",
  styleUrls: ["./parent-account-form.component.css"]
})
export class ParentAccountFormComponent implements OnInit, OnDestroy {
  page: "" | "PIN" | "attach-card" | "info" = "";
  bankAccountForm: FormGroup;
  banks: Bank[] = [];
  spinner: boolean = false;
  guardianID: string = undefined;
  destroy: Subscription[] = [];
  creditCardForm: FormGroup;
  PINFORM: FormGroup;
  currentParentPhone: string;
  constructor(
    private generalservice: GeneralService,
    private store: Store,
    private chatservice: ChatService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.banks = this.chatservice.fetchBankNames();
    this.bankAccountForm = this.fb.group({
      bank_code: ["", Validators.required],
      account_number: ["", Validators.required],
      account_name: ["", Validators.required]
    });

    this.creditCardForm = this.fb.group({
      cvv: ["", Validators.required],
      card_number: ["", Validators.required],
      card_name: ["", Validators.required],
      expiry_month: ["", Validators.required],
      expiry_year: ["", Validators.required]
    });

    this.PINFORM = this.fb.group({
      PIN: ["", Validators.required]
    });

    this.destroy[0] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        const { guardian, phone } = val as Parent;
        this.guardianID = guardian;
        this.currentParentPhone = phone;
      });
  }

  get accountNumber() {
    return this.bankAccountForm.get("account_no");
  }
  get bankName() {
    return this.bankAccountForm.get("bank_code");
  }

  get accountName() {
    return this.bankAccountForm.get("account_name");
  }

  public bankNameIsRequired() {
    return this.bankName.hasError("required") && this.bankName.touched;
  }

  confirmParent(form: FormGroup) {
    // this.page = 'attach-card';
    this.spinner = true;
    const formToSubmit = { ...form.value };
    formToSubmit.phone = this.currentParentPhone;
    this.chatservice.confirmParentPIN(formToSubmit).subscribe(
      val => {
        const { status } = val.data;
        if (status) {
          this.spinner = false;
          this.page = "attach-card";
        }
      },
      err => console.log(err)
    );
  }

  checkAccountDetailsEntered() {
    if (this.accountNumber.value.length < 10) return;
    this.spinner = true;
    let obj = {
      account_number: this.accountNumber,
      bank_code: this.bankName.value
    };
    this.chatservice.confirmAccountDetailsOfParent(obj).subscribe(
      val => {
        this.accountName.patchValue(val["data"].account_name);
        this.spinner = false;
      },
      err => {
        console.log(err);
        this.spinner = false;
      }
    );
  }

  submitAccountDetailsForm(form: FormGroup) {
    this.spinner = true;
    const formToSubmit: Partial<CompleteParentInfomation> = { ...form.value };
    formToSubmit.guardian = this.guardianID;
    this.chatservice.saveParentAccountInformation(formToSubmit).subscribe(
      val => {
        const { account_name, account_number, bank_code } = val.data;
        this.store.dispatch(
          new generalActions.updateParentAcctInfo({
            account_name,
            account_number,
            bank_code
          })
        );
        this.spinner = false;
        this.page = "info";
      },
      err => {
        this.generalservice.errorNotification(
          "Oops, we could not update your account information at this time. Please try again"
        );
        this.spinner = false;
        console.log(err);
      }
    );
  }

  completeThis() {
    this.spinner = false;
    const responseFromParent = new replyGiversOrReceivers(
      `I have entered my account information.`,
      "right"
    );
    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Congrats, Your offer letter is ready. it will be sent to your eail: femiapps@gmail.com`,
      "left",
      "",
      ``
    );

    this.generalservice.responseDisplayNotifier(responseFromParent);
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    this.generalservice.handleFlowController("");
    this.generalservice.setStage("account-info", {});
    setTimeout(() => {
      this.generalservice.nextChatbotReplyToGiver = undefined;
      const chatbotResponse = new replyGiversOrReceivers(
        `If you need further assistance on this service Chat with us here?`,
        "left",
        "chat",
        "",
        "prevent"
      );
      this.generalservice.responseDisplayNotifier(chatbotResponse);
    }, 800);
  }

  saveCardInfo(form: FormGroup) {
    this.spinner = true;
    const formToSubmit: ParentCreditCardInfo &
      Partial<CompleteParentInfomation> = { ...form.value };
    formToSubmit.guardian = this.guardianID;
    this.chatservice.saveParentCreditCardInformation(formToSubmit).subscribe(
      val => {
        const {
          cvv,
          card_name,
          card_number,
          expiry_month,
          expiry_year
        } = val.data;
        this.store.dispatch(
          new generalActions.updateParentCreditCardInfo({
            cvv,
            card_name,
            card_number,
            expiry_month,
            expiry_year
          })
        );
        this.completeThis();
      },
      err => {
        this.generalservice.errorNotification(
          "Oops, we could not add this card to your profile. Please try again"
        );
        this.spinner = false;
        console.log(err);
      }
    );
  }

  restrictInputDigits(event: Event, number: number) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.substring(0, number);
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
  }
}
