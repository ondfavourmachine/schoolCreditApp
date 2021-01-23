import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  ElementRef,
  OnChanges
} from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import {
  ChatService,
  FinancialInstitution
} from "src/app/services/ChatService/chat.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  CompleteParentInfomation,
  Parent,
  ParentIdInfo
} from "src/app/models/data-models";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";

@Component({
  selector: "app-bank-partnership",
  templateUrl: "./bank-partnership.component.html",
  styleUrls: ["./bank-partnership.component.css"]
})
export class BankPartnershipComponent implements OnInit, OnDestroy, OnChanges {
  @Output("previousPage") previousPage = new EventEmitter<string>();
  @Input("previous") previous: any;
  page:
    | ""
    | "bvn"
    | "valid-id"
    | "bank-details"
    | "checking"
    | "enter-id"
    | "result"
    | "work-form"
    | "address-info"
    | "preambleToForms" = undefined;
  pageViews: string[] = ["work-form"];
  selected: string;
  BVNFORM: FormGroup;
  IDForm: FormGroup;
  destroy: Subscription[] = [];
  spinner: boolean = false;
  parentDetails: Parent;
  smartView: {componentToLoad: string, info: any} = {componentToLoad: undefined, info: undefined}
  result: object & FinancialInstitution = undefined;
  constructor(
    private generalservice: GeneralService,
    private chatservice: ChatService,
    private fb: FormBuilder,
    private store: Store,
    private elem: ElementRef
  ) {}

  ngOnChanges(){
      this.destroy[1] = this.generalservice.smartView$.subscribe(val => {
      if((this.elem.nativeElement.tagName as string).trim().substring(4).toLowerCase().includes(val.component)){
        this.smartView = {...val}
        this.page = this.smartView.info;
      }
    })
  }

  ngOnInit(): void {
    this.chatservice.getFinancialInstitution().subscribe(val => {
      this.result = val;
      this.smartView.info ? this.page = this.smartView.info  : this.page = "";
    });

    this.destroy[0] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        this.parentDetails = val as Parent;
      });

    this.BVNFORM = this.fb.group({
      bvn: ["", Validators.required]
    });
    this.IDForm = this.fb.group({
      ID_number: ["", Validators.required]
    });

    
  }

  selectThis(event) {
    const p =
      event.target instanceof HTMLImageElement
        ? event.target.nextElementSibling
        : (event.target as HTMLElement).querySelector(".bolded");

    // debugger;
    this.selected = p.textContent.trim();
  }

  accepted(form: FormGroup) {
    let preferredID;
    this.spinner = true;
    let parentID: Partial<CompleteParentInfomation>;
    if (/voters/i.test(this.selected)) {
      preferredID = "1";
    }
    if (/national/i.test(this.selected)) {
      preferredID = "2";
    }
    if (/international/i.test(this.selected)) {
      preferredID = "3";
    }
    if (/drivers/i.test(this.selected)) {
      preferredID = "4";
    }

    parentID = {
      preferred_ID: preferredID,
      guardian: this.parentDetails.guardian,
      ID_number: form.value.ID_number
    };

    this.chatservice.saveAndVerifyParentID(parentID).subscribe(
      val => {
        const { preferred_ID, ID_number, BVN } = val.data;
        this.store.dispatch(
          new generalActions.updateParentIDInformation({
            preferred_ID,
            ID_number,
            BVN
          })
        );
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.generalservice.handleFlowController("");
        this.generalservice.nextChatbotReplyToGiver = undefined;
        const responseFromParent = new replyGiversOrReceivers(
          `Thanks for this information. ${this.result.lender_name} is preparing your final offer`,
          "left",
          "",
          "prevent"
        );

        this.generalservice.responseDisplayNotifier(responseFromParent);
        // this.generalservice.setStage("bank-form", {});
        this.spinner = false;
        setTimeout(() => {
          this.generalservice.nextChatbotReplyToGiver = undefined;
          const chatbotResponse = new replyGiversOrReceivers(
            `They will also like to know which Which account will we be debiting you from?`,
            "left",
            "Add Account",
            `addaccount`,
            "prevent"
          );
          this.generalservice.responseDisplayNotifier(chatbotResponse);
        }, 800);
      },
      err => {
        this.spinner = false;
        this.generalservice.errorNotification(
          `We couldn't verify ${this.selected}: ${this.IDForm.value.ID_number}. Please check to make sure you entered correct information.`
        );
        console.log(err);
      }
    );
  }

  submitParentBVN(form: FormGroup) {
    this.spinner = true;
    this.chatservice
      .sendAndVerifyBvnAndDOB({
        phone: this.parentDetails.phone,
        bvn: form.value.bvn,
        dob: this.parentDetails.date_of_birth
      })
      .subscribe(
        async val => {
          const { status, message } = val;
          if (!status) {
            this.spinner = false;
            this.generalservice.warningNotification(
              message + "Please enter a valid bvn"
            );
            throw "Error";
          }
          try {
            await this.chatservice.saveParentBVN({
              BVN: form.value.bvn,
              guardian: this.parentDetails.guardian
            });
          } catch (error) {
            this.spinner = false;
            this.generalservice.warningNotification(
              `An error occured while validating your BVN. Please check your internet and try again!`
            );
          }

          const updateTheStore: Partial<ParentIdInfo> = { BVN: form.value.bvn };
          this.store.dispatch(
            new generalActions.updateParentIDInformation(updateTheStore)
          );
          this.spinner = false;
          this.page = "valid-id";
        },
        err => {
          console.log(err);
          this.spinner = false;
          this.generalservice.warningNotification(
            `Couldn't validate your BVN at this time. Please make sure you entered the correct BVN associated with you account and try again!`
          );
        }
      );
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
    this.smartView.componentToLoad = undefined;
    this.smartView.info = undefined;
  }
}
