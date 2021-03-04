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
  AChild,
  CompleteParentInfomation,
  Offers,
  Parent,
  ParentIdInfo
} from "src/app/models/data-models";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { map, pluck } from "rxjs/operators";
import { ChildrenState } from "src/app/store/reducers/children.reducer";

const CreditClan = window['CreditClan'];
let cc;
CreditClan ?  cc = CreditClan.init('z2BhpgFNUA99G8hZiFNv77mHDYcTlecgjybqDACv') : cc = {};

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
    | "bank-details" | "preamble_to_bankdetails"
    | "checking"
    | "enter-id"
    | "result"
    | "work-form"
    | "address-info" | 'bank_statement' | 'iframe_container' | "card_tokenisation"
    | "preambleToForms" | 'pre_bankstatement' = "preambleToForms";
  text: string = "Sending Loan request....";
  pageViews: string[] = ["work-form"];
  selected: string;
  BVNFORM: FormGroup;
  IDForm: FormGroup;
  destroy: Subscription[] = [];
  spinner: boolean = false;
  parentDetails: Parent;
  childInfo: any;
  parentRequestAndAccount: {}
  smartView: { componentToLoad: string; info: any } = {
    componentToLoad: undefined,
    info: undefined
  };
  result: object & FinancialInstitution = undefined;
  loanAmount: string | number;
  offersToShowParent: Partial<Offers> = {};
  constructor(
    private generalservice: GeneralService,
    private chatservice: ChatService,
    private fb: FormBuilder,
    private store: Store,
    private elem: ElementRef
  ) {}

  ngOnChanges() {
    // this.destroy[1] = this.generalservice.smartView$.subscribe(val => {
    //   if (val) {
    //     if (
    //       (this.elem.nativeElement.tagName as string)
    //         .trim()
    //         .substring(4)
    //         .toLowerCase()
    //         .includes(val.component)
    //     ) {
    //       this.smartView = { ...val };
    //       this.page = this.smartView.info;
    //     }
    //   } else {
    //     this.page = "preambleToForms";
    //     // this.page = 'checking'
    //   }
    // });
  }

  async ngOnInit() {
    this.previousPage.emit('firstPage');
    this.BVNFORM = this.fb.group({
      bvn: ["", Validators.required]
    });
    this.IDForm = this.fb.group({
      ID_number: ["", Validators.required]
    });

    this.destroy[0] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        this.parentDetails = val as Parent;
      });

    this.destroy[1] = this.store.select(fromStore.getParentState)
    .pipe(map(val => {
      console.log(val);
      const parent = val as any;
      return {
        request_id: parent['parent_loan_request_status']['creditclan_request_id'],
        account: parent['parent_account_info']
      }
    }))
    .subscribe(
      val => {
        this.parentRequestAndAccount = {...val};
      }
    )
    let childArray:Array<Partial<AChild>>
    this.destroy[2] = this.store
      .select(fromStore.getCurrentChildState)
      .pipe(pluck("child_info"))
      .subscribe(val => {
       childArray = Array.from((val as Map<string, Partial<AChild>>).values());
        this.loanAmount = childArray.reduce((acc, element) => {
          acc = parseInt(element.tuition_fees) + acc;
          return acc
        }, 0)
      });
      const arrayOfChildId: {id: any, amount: string}[] = childArray.map(element => {
        return{
          id: element.child_id || element.id,
          amount: element.tuition_fees
        }
      })
      if(this.parentDetails.loan_request == null){
        try {
          const res = await this.chatservice.sendLoanRequest({
            school_id: this.parentDetails.school_id || 1,
            guardian_id: this.parentDetails.guardian,
            loan_amount: this.loanAmount as string,
            child_data: arrayOfChildId
          });
          const { message } = res;
          if (message == "request created!")
            this.text = "Awaiting response from financial institutions....";
        } catch (error) {
          this.text = "Sending Loan request ...";
          this.generalservice.errorNotification(
            "An error occured while sending your loan request!"
          );
        }
      }
    
    // this.chatservice.getFinancialInstitution().subscribe(val => {
    //   this.result = val;
    //   this.smartView.info
    //     ? (this.page = this.smartView.info)
    //     : (this.page = "");
    // });

    this.destroy[0] = this.store
    .select(fromStore.getParentState)
    .pipe(pluck("offers"))
    .subscribe(val => this.offersToShowParent = val);

    window.addEventListener('message', async (e)=> {
        if(e['origin'] == 'https://bankstatementwidget.creditclan.com'){
          console.log(e);
          await this.chatservice.updateBackEndOfSuccessfulCompletionOfWidgetStage(this.parentRequestAndAccount['request_id'], '2');
          this.page = '';
        }
    })

   
  }

  changeToWorkAndLoadWidget(page: string){
    const a =  (document.querySelector('.hiddenWidget') as HTMLElement);
    this.spinner = true;
    this.launchWidget()
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
        // this.store.dispatch(
        //   new generalActions.updateParentIDInformation({
        //     preferred_ID,
        //     ID_number,
        //     BVN
        //   })
        // );
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
          // this.store.dispatch(
          //   new generalActions.updateParentIDInformation(updateTheStore)
          // );
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

  // this will be removed Later
  async insertIframeToDom(){
    const modalBody = document.querySelector('.modal-body') as HTMLElement
    this.spinner = true;
    this.page = 'iframe_container';
    console.log(this.parentRequestAndAccount);
    const res = await this.chatservice.getIframeSrcForCardTokenization(this.parentRequestAndAccount['request_id']);
    const {url} = res;
    try{ 
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups');
      iframe.src = `${url}`
      iframe.setAttribute('frameborder', '0');
      iframe.id = 'iframe_for_payment'
      iframe.height = "600";
      iframe.width = (modalBody.offsetWidth - 5).toString();
      iframe.onload = () => {this.spinner = false;}
      (document.getElementById('divforIframe') as HTMLDivElement).insertAdjacentElement('afterbegin', iframe);
  
      // window.addEventListener('resize', this.resizeIframe)
    }catch(e){
        console.log(e);
    }
  }

  async insertBSIframeIntoDOM(){
    const modalBody = document.querySelector('.modal-body') as HTMLElement
    this.spinner = true;
    this.page = 'iframe_container';
    const res = await this.chatservice.getIframeSrcForBankstatement(
      this.parentRequestAndAccount['request_id'],
       this.parentRequestAndAccount['account']
      );
    const {url} = res;
    try{ 
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups');
      iframe.src = `${url}`
      iframe.setAttribute('frameborder', '0');
      iframe.id = 'iframe_for_payment'
      iframe.height = "600";
      iframe.width = (modalBody.offsetWidth - 5).toString();
      iframe.onload = () => {this.spinner = false;}
      (document.getElementById('divforIframe') as HTMLDivElement).insertAdjacentElement('afterbegin', iframe);
  
      // window.addEventListener('resize', this.resizeIframe)
    }catch(e){
        console.log(e);
    }
  }

   launchWidget() {
    this.spinner = true;
    let totalFees: number = 0;
    const disconnect = this.store
      .select(fromStore.getCurrentChildState)
      .subscribe((val: any) => {
        const { total_tuition_fees } = val as ChildrenState;
        totalFees += total_tuition_fees;
      });
    cc.open();
     // listen for ready event window 
    cc.on('ready', () => {
      console.log('Ready..');
      // const merchant = this._auth.merchant;
      const data = {
        loan:  {amount: totalFees, tenor: 3 },
        picture: this.parentDetails.picture,
        personal: {
          user_id: this.parentDetails.guardian,
          full_name: this.parentDetails.full_name,
          email: this.parentDetails.email,
          phone: this.parentDetails.phone,
          date_of_birth: this.parentDetails.date_of_birth,
          gender: this.parentDetails.gender,
          marital_status: '',
          nationality: '',  // 
          state_of_origin: this.parentDetails.state // pass the id of state you collected
        },
        address:{
          street_address: this.parentDetails.address,
          state: this.parentDetails.state,
          lga: this.parentDetails.lga,
        }
        // bank: {
        //   bank_id: merchant.bank_id,
        //   bank_code: merchant.bank_code,
        //   account_name: merchant.account_name,
        //   account_number: merchant.account_number
        // }
      };
      const forms = [
        'location',
        'personal',
        'bvn',
        'address',
        'picture',
        'employment', //
        'education',
        'nok',
        'frequently_called_numbers',
        'identity',
        'attachment',
        // 'categories',
        // 'bank',
        // 'company_profile',
        // 'products_pictures',
        // 'sales_summary',
        // 'physical_store',
        // 'business_address',
        // 'operating_expenses',
        // 'business_income',
        'expense',
        // 'attachment_business',
      ];
      cc.start(data, forms);
      this.spinner = false;
      disconnect.unsubscribe();
    });
    cc.on('request', async (data) => {
      //  if the request was created successfully
      console.log('Request..', data);
      const loanRequest = {creditclan_request_id: data.dd, eligible: data.eligible};
      this.store.dispatch(new generalActions.updateParentLoanRequest(loanRequest));
      debugger;
      this.page = 'preamble_to_bankdetails';
      await this.chatservice.updateCreditClanRequestId(this.parentDetails.loan_request, loanRequest.creditclan_request_id);
      await this.chatservice.updateBackEndOfSuccessfulCompletionOfWidgetStage(this.parentDetails.loan_request.toString(), '1');
      this.spinner = false;
     
      
    });
    cc.on('cancel', (data) => {
      //  if the user cancels the widget / clicks the close button
      console.log('Cancel..', data);
      this.store.dispatch(new generalActions.checkLoanProcess('failed'));
      this.kickStartResponse();
    });
  }

  kickStartResponse(){
    (document.querySelector('.fakeButton') as HTMLElement).click();
  }

  showResponseToCompleteBSAnalysis(){

  }

  changeUpView(event: any){
    // this.generalservice.handleSmartViewLoading({})
    this.page = event;
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
    this.smartView.componentToLoad = undefined;
    this.smartView.info = undefined;
  }
}
