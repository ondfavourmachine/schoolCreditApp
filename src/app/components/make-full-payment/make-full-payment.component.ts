import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { Subscription } from "rxjs";
import { pluck } from "rxjs/operators";
import * as fromStore from "../../store";
import { Store } from "@ngrx/store";
import { Bank, SchoolDetailsModel } from "src/app/models/data-models";

@Component({
  selector: "app-make-full-payment",
  templateUrl: "./make-full-payment.component.html",
  styleUrls: ["./make-full-payment.component.css"]
})
export class MakeFullPaymentComponent implements OnInit {
  destroyAnything: Subscription[] = [];
  schoolDetails:SchoolDetailsModel;
  bankName: Bank;
  constructor(
    private generalservice: GeneralService,
    private store: Store) {}

  ngOnInit(): void {
    this.destroyAnything[0]= this.store.select(fromStore.getSchoolDetailsState) 
    .pipe(pluck('school_Info'))
    .subscribe((val: SchoolDetailsModel) => this.schoolDetails = val)
    
    const banks: Array<Bank> = JSON.parse(sessionStorage.getItem('allBanks')).data;
    this.bankName = banks.find(element => element.bank_code == this.schoolDetails.bank_code)
    
  }

  doneSendingMoney() {
    const responseFromParent = new replyGiversOrReceivers(
      `I have made payments to account provided.`,
      "right"
    );

    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Thank you for making payment. Please take a screen shot of your transfer for evidence`,
      "left",
      "",
      ``
    );

    this.generalservice.responseDisplayNotifier(responseFromParent);
    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    setTimeout(() => {
      this.generalservice.handleFlowController("");
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `Thank you for using this service.`,
        "left",
        "",
        ``,
        "prevent"
      );

      const chatbotResponse = new replyGiversOrReceivers(
        `Adanma High School will send you a confirmation email, once they receive payment.`,
        "left",
        "",
        ``,
        "prevent"
      );
      this.generalservice.responseDisplayNotifier(chatbotResponse);
      sessionStorage.removeItem('savedChats');
    }, 800);
  }

  cancel(){
    this.generalservice.handleFlowController("");
  }
}
