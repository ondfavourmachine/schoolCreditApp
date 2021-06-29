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
import { map, pluck, tap } from "rxjs/operators";
import { ChildrenState } from "src/app/store/reducers/children.reducer";

// const CreditClan = window["CreditClan"];
// let cc;
// CreditClan
//   ? (cc = CreditClan.init(
//     {
//       key: 'z2BhpgFNUA99G8hZiFNv77mHDYcTlecgjybqDACv',
//       banner: 'https://images.unsplash.com/photo-1605902711834-8b11c3e3ef2f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
//     }
//   ))
//   : (cc = {});

  //  (cc = CreditClan.init("z2BhpgFNUA99G8hZiFNv77mHDYcTlecgjybqDACv"))
   

@Component({
  selector: "app-bank-partnership",
  templateUrl: "./bank-partnership.component.html",
  styleUrls: ["./bank-partnership.component.css"]
})
export class BankPartnershipComponent implements OnInit, OnDestroy, OnChanges {
  @Output("previousPage") previousPage = new EventEmitter<string>();
  @Input("previous") previous: any;
  page:
    | "offers"
    | "bvn"
    | "valid-id"
    | "bank-details"
    | "preamble_to_bankdetails"
    | "checking"
    | "enter-id"
    | "result"
    | "work-form"
    | "address-info"
    | "bank_statement"
    | "iframe_container"
    | "card_tokenisation"
    | "preambleToForms"
    | "verify-data"
    | "pre_bankstatement" 
    | 'ask_to_make_payment' | 'confirm_upfront_payment_deduction' | 'notify-school'
    | "sorry-page" = "preambleToForms";
  text: string = "Sending Loan request....";
  pageViews: string[] = ["work-form"];
  selected: string;
  BVNFORM: FormGroup;
  IDForm: FormGroup;
  destroy: Subscription[] = [];
  spinner: boolean = false;
  parentDetails: Parent;
  childInfo: any;
  parentRequestAndAccount: {};
  smartView: { componentToLoad: string; info: any } = {
    componentToLoad: undefined,
    info: undefined
  };
  result: object & FinancialInstitution = undefined;
  loanAmount: string | number;
  offersToShowParent: Array<Partial<Offers>> = [];
  selectedOffer: any;
  informationForVerifyComp: {heading: string} = undefined;
  cc: any;
  breakPointInDataWidget: {breakpoint?: number, request_id?: number, offer?: Record<string, string>} = {}
  constructor(
    private generalservice: GeneralService,
    private chatservice: ChatService,
    private fb: FormBuilder,
    private store: Store,
    private elem: ElementRef
  ) {}

  ngOnChanges() {
    this.destroy[0] = this.generalservice.smartView$.subscribe(val => {
      if (val) {
        if (
          (this.elem.nativeElement.tagName as string)
            .trim()
            .substring(4)
            .toLowerCase()
            .includes(val.component)
        ) {
          // card_tokenisation

          this.smartView = { ...val };
          this.page = this.smartView.info;
        }
      } else {
        this.page = "preambleToForms";
        // this.page = 'checking'
      }
    });
  }

  async ngOnInit() {
    this.previousPage.emit("firstPage");
    this.BVNFORM = this.fb.group({
      bvn: ["", Validators.required]
    });
    this.IDForm = this.fb.group({
      ID_number: ["", Validators.required]
    });

    this.destroy[1] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        this.parentDetails = val as Parent;
      });
    tap(val => console.log(val)),
      (this.destroy[2] = this.store
        .select(fromStore.getParentState)
        .pipe(
          map(val => {
            const parent = val as any;
            return {
              request_id:
                parent["parent_loan_request_status"]["creditclan_request_id"],
              account: parent["parent_account_info"]
            };
          })
        )
        .subscribe(val => {
          this.parentRequestAndAccount = { ...val };
        }));
    

    // this.chatservice.getFinancialInstitution().subscribe(val => {
    //   this.result = val;
    //   this.smartView.info
    //     ? (this.page = this.smartView.info)
    //     : (this.page = "");
    // });

    this.destroy[4] = this.store
      .select(fromStore.getParentState)
      .pipe(pluck("offers"))
      .subscribe((val: Array<Partial<Offers>>) => {
        this.offersToShowParent = val;
      });

    this.destroy[5] = this.generalservice.reset$.subscribe((val: string) => {
      if (val.length < 1) return;
      this.page = "preambleToForms";
    });
    window.addEventListener("message", async e => {
      if (e["origin"] == "https://bankstatementwidget.creditclan.com") {
        try {
          await this.chatservice.updateBackEndOfSuccessfulCompletionOfWidgetStage(
            this.parentDetails.loan_request.toString(),
            "2"
          );
          this.page = "offers";
        } catch (e) {
          this.page = "offers";
        }
      }
    });

    sessionStorage.removeItem('listOfChildren');
  }

  selectOffers(index: string) {
    this.selectedOffer = index;
  }
  changeToWorkAndLoadWidget(page: string, event?: Event) {
    if(sessionStorage.getItem('unverified_parent')){
      sessionStorage.setItem('showSkip', 'false');
      this.informationForVerifyComp = {
        heading: `Your primary contact details is still unverified. Please take a few seconds to verify your email`
      }
      this.page = 'verify-data';
      return;
    }
    if(event){
    const button = event.target as HTMLButtonElement;
    button.innerHTML = `<i class="fa fa-circle-notch fa-spin"></i>  Continue application`;
    button.disabled = true;
    const a = document.querySelector(".hiddenWidget") as HTMLElement;
    this.spinner = true;
    this.preInitiationToDataCollectionWidget(button);
    }else{
    this.spinner = true;
    this.preInitiationToDataCollectionWidget();
    }
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
  async insertIframeToDom() {
    const modalBody = document.querySelector(".modal-body") as HTMLElement;
    this.spinner = true;
    this.page = "iframe_container";
    // console.log(this.parentRequestAndAccount);

    try {
      const res = await this.chatservice.getIframeSrcForCardTokenization(
        this.parentRequestAndAccount["request_id"]
      );
      // console.log(res);
      if ((res as Object).hasOwnProperty("url")) {
        const { url } = res;
        const iframe = document.createElement("iframe");
        iframe.setAttribute(
          "sandbox",
          "allow-same-origin allow-scripts allow-popups"
        );
        iframe.src = `${url}`;
        iframe.setAttribute("frameborder", "0");
        iframe.id = "iframe_for_payment";
        iframe.height = "600";
        iframe.width = (modalBody.offsetWidth - 5).toString();
        iframe.onload = () => {
          this.spinner = false;
        };
        (document.getElementById(
          "divforIframe"
        ) as HTMLDivElement).insertAdjacentElement("afterbegin", iframe);
      } else {
        throw res.message;
      }

      // window.addEventListener('resize', this.resizeIframe)
    } catch (e) {
      console.log(e);
      this.page = "sorry-page";
      this.spinner = false;
    }
  }

  async insertBSIframeIntoDOM() {
    const modalBody = document.querySelector(".modal-body") as HTMLElement;
    this.spinner = true;
    this.page = "iframe_container";
    const res = await this.chatservice.getIframeSrcForBankstatement(
      this.parentRequestAndAccount["request_id"],
      this.parentRequestAndAccount["account"]
    );
    const { url } = res;
    try {
      const iframe = document.createElement("iframe");
      iframe.setAttribute(
        "sandbox",
        "allow-same-origin allow-scripts allow-popups"
      );
      iframe.src = `${url}`;
      iframe.setAttribute("frameborder", "0");
      iframe.id = "iframe_for_payment";
      iframe.height = "600";
      iframe.width = (modalBody.offsetWidth - 5).toString();
      iframe.onload = () => {
        this.spinner = false;
      };
      (document.getElementById(
        "divforIframe"
      ) as HTMLDivElement).insertAdjacentElement("afterbegin", iframe);

      // window.addEventListener('resize', this.resizeIframe)
    } catch (e) {
      console.log(e);
    }
  }

  async launchWidget(button?: HTMLButtonElement) {
    // this.spinner = true;
    // let totalFees: number = 0;
    // const disconnect = this.store
    //   .select(fromStore.getCurrentChildState)
    //   .subscribe((val: any) => {
    //     const { total_tuition_fees } = val as ChildrenState;
    //     totalFees += total_tuition_fees;
    //   });

    // const pictureForWidget = await this.generalservice.fileToDataurl(this
    //   .parentDetails.picture as File);
    // cc.open();
    // cc.on("ready", () => {
    //   console.log("Ready..");
    //   const data = {
    //     loan: { amount: totalFees, tenor: 3 },
    //     profile: {
    //       picture: pictureForWidget,
    //       personal: {
    //         // user_id: this.parentDetails.guardian,
    //         full_name: this.parentDetails.full_name,
    //         email: this.parentDetails.email,
    //         phone: this.parentDetails.phone,
    //         date_of_birth: this.parentDetails.date_of_birth,
    //         gender: this.parentDetails.gender == "1" ? "0" : "1",
    //         marital_status: "",
    //         nationality: "", //
    //         state_of_origin: this.parentDetails.state // pass the id of state you collected
    //       },
    //       address: {
    //         street_address: this.parentDetails.address,
    //         state: this.parentDetails.state,
    //         lga: this.parentDetails.lga
    //       }
    //     }

    //     // bank: {
    //     //   bank_id: merchant.bank_id,
    //     //   bank_code: merchant.bank_code,
    //     //   account_name: merchant.account_name,
    //     //   account_number: merchant.account_number
    //     // }
    //   };
    //   const forms = [
    //     "location",
    //     "identity",
    //     "profile",
    //     "employment",
    //     "frequently_called_numbers"
    //   ];
    //   cc.start(data, forms);
    //   this.spinner = false;
    //   disconnect.unsubscribe();
    //   if(button){
    //     button.innerHTML = "continue application";
    //      button.disabled = false;
    //   }
    // });
    // cc.on("request", async data => {
    //   //  if the request was created successfully
    //   // console.log(data);
    //   const loanRequest = {
    //     creditclan_request_id: data.request_id,
    //     eligible: true
    //   };
    //   console.log(loanRequest);
    //   this.store.dispatch(
    //     new generalActions.updateParentLoanRequest(loanRequest)
    //   );
    //   this.page = "card_tokenisation";
    //   await this.chatservice.updateCreditClanRequestId(
    //     this.parentDetails.loan_request,
    //     loanRequest.creditclan_request_id
    //   );
    //   await this.chatservice.updateBackEndOfSuccessfulCompletionOfWidgetStage(
    //     this.parentDetails.loan_request.toString(),
    //     "1"
    //   );
    //   await this.chatservice.updateBackEndOfSuccessfulCompletionOfWidgetStage(
    //     this.parentDetails.loan_request.toString(),
    //     "2"
    //   );
    //   const offers = await this.chatservice.getLoanOffers(
    //     loanRequest["creditclan_request_id"]
    //   );
    //   this.store.dispatch(
    //     new generalActions.updateParentOffers(
    //       offers["offers"][0].amount == 0 ? [] : [].concat(offers["offers"])
    //     )
    //   );
    //   this.spinner = false;
    // });
    // cc.on("cancel", data => {
    //   //  if the user cancels the widget / clicks the close button
    //   console.log("Cancel..", data);
    //   this.store.dispatch(new generalActions.checkLoanProcess("failed"));
    //   this.kickStartResponse();
    // });
    
  }

  kickStartResponse() {
    (document.querySelector(".fakeButton") as HTMLElement).click();
  }

  switchToFakeSearchingPage() {
    this.page = "checking";
    setTimeout(() => {
      this.page = "offers";
    }, 3000);
  }

  changeUpView(event: any) {
    // this.generalservice.handleSmartViewLoading({})
    this.page = event;
  }

  continueToDataWidget(){
    this.informationForVerifyComp = undefined;
    sessionStorage.removeItem('unverified_parent');
    this.changeToWorkAndLoadWidget('work-form');
  }

  async preInitiationToDataCollectionWidget(button?: HTMLButtonElement){
    // const CreditClan = window['CreditClan'];
    const CreditClan = window['EligibilityWidget'];
    let school_id;
    const pictureForWidget = await this.generalservice.fileToDataurl(this.parentDetails.picture as File);
    let totalFees: number = 0;
    const disconnect = this.store
            .select(fromStore.getCurrentChildState)
            .subscribe((val: any) => {
              const { total_tuition_fees } = val as ChildrenState;
              totalFees += total_tuition_fees;
            });
    const schoolSubscription = this.store.select(fromStore.getSchoolDetailsState)
    .pipe(tap(val =>  {school_id = val["school_Info"].id})).subscribe();
     const data = {
                  request: { amount: totalFees, tenor: 3 },
                  profile: {
                      profile_image: pictureForWidget,
                      full_name: this.parentDetails.full_name,
                      email: this.parentDetails.email,
                      phone: this.parentDetails.phone,
                      date_of_birth: this.parentDetails.date_of_birth,
                      gender: this.parentDetails.gender == "1" ? "0" : "1",
                      marital_status: "",
                      nationality: "", //
                      state_of_origin: this.parentDetails.state // pass the id of state you collected
                  },
                  school_id: school_id,
                  request_id: this.parentDetails.loan_request,
                  // stage: 1
                  config: {
                    no_frequently_called_numbers: 0, // Set to 0 if not needed, Max is 2
                    analyze_bank_statement: false,
                    tokenize_card: false,
                    show_offers: false
                  },
                  home_address: {
                    address: this.parentDetails.address,
                    state_id: this.parentDetails.state,
                    lga_id: this.parentDetails.lga
                  },
          };

        // console.log(data);
       this.cc = CreditClan.init({
         key: 'z2BhpgFNUA99G8hZiFNv77mHDYcTlecgjybqDACv',
         banner: 'https://images.unsplash.com/photo-1605902711834-8b11c3e3ef2f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
         onReady: async () => {
          this.spinner = true;     
          this.cc.start(data);
          // this.loading = '';
        },

        onRequest: async ({ request_id, user_id, offer }) => {
            console.log(request_id, user_id, offer);
            const loanRequest = {
              creditclan_request_id: request_id,
              eligible: true
            };
            // console.log(loanRequest);
            this.store.dispatch(
              new generalActions.updateParentLoanRequest(loanRequest)
            );
            this.page = 'notify-school';

            if(!this.parentDetails.loan_request){
              try {
                await this.sendLoanRequestToBankEnd();
              } catch (error) {
                this.page = 'sorry-page';
              }
            }
             
            
          
             // check if card exists for this user?
            // call endpoint here

            // try {
            //   // this.page = "card_tokenisation";
            //   const res = await this.chatservice.checkIfParentHasSavedCardDetails(request_id, user_id);
            //   if(res.data.card){
            //     this.page = 'ask_to_make_payment';
            //   }else{
            //     this.page = 'card_tokenisation';
            //   }
            // } catch (error) {
            //   this.page = "card_tokenisation";
            // }
            await this.chatservice.updateCreditClanRequestId(
              this.parentDetails.loan_request,
              loanRequest.creditclan_request_id
            );
            await this.chatservice.updateBackEndOfSuccessfulCompletionOfWidgetStage(
              this.parentDetails.loan_request.toString(),
              "1"
            );
            const offers = await this.chatservice.getLoanOffers(
              loanRequest["creditclan_request_id"]
            );
            try {
              this.store.dispatch(
              new generalActions.updateParentOffers(
                offers["offers"][0].amount == 0 ? [] : [].concat(offers["offers"])
              )
            );
            } catch (error) {
              console.log(error);
            }
            
            this.spinner = false;
            disconnect.unsubscribe();
            schoolSubscription.unsubscribe();

            // return from this bank partnership components

          this.generalservice.handleFlowController("");
          const responseFromParent = new replyGiversOrReceivers(
            `I have provided all relevant information`,
            "right"
          );
          // console.log(this.tuitionFeesTotal);
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `Thank you for your application. Your School has been notified to review your request.`,
            "left",
          );
          this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
          this.generalservice.responseDisplayNotifier(responseFromParent);
        },

        onBreakpoint: async (data) =>{
          this.breakPointInDataWidget = {...this.breakPointInDataWidget,  ...data};
          console.log(this.breakPointInDataWidget);
          if(this.breakPointInDataWidget.breakpoint == 2 && 
            (this.breakPointInDataWidget as Object).hasOwnProperty('request_id')
            && !this.parentDetails.loan_request
            ){
            const loanRequest = {
              creditclan_request_id: this.breakPointInDataWidget.request_id,
              eligible: true
            };
            this.store.dispatch(
              new generalActions.updateParentLoanRequest(loanRequest)
            );
            try {
              await this.sendLoanRequestToBankEnd();
              await this.chatservice.updateCreditClanRequestId(
                this.parentDetails.loan_request,
                this.breakPointInDataWidget.request_id
              );
            } catch (error) {
              this.page = 'sorry-page';
            }
          }
          this.store.dispatch(new generalActions.updateBreakPoint(this.breakPointInDataWidget.breakpoint));
          await this.chatservice.updateCreditClanRequestId(
            this.parentDetails.loan_request,
            this.breakPointInDataWidget.request_id
          );
          await this.chatservice.updateBackEndWithBreakpoint({breakpoint: this.breakPointInDataWidget.breakpoint, creditclan_request_id: this.breakPointInDataWidget.request_id})
          if((this.breakPointInDataWidget as Object).hasOwnProperty('offer')){
            await this.chatservice.updateBackEndWithOffer({request_id: this.breakPointInDataWidget.request_id, offer: this.breakPointInDataWidget.offer})
          }
        },

        onCancel : async () => {
          //  if the user cancels the widget / clicks the close button
          // update Nebechi of the breakpoint in whihc the user left.
            console.log("Cancel..");
            if((this.breakPointInDataWidget as Object).hasOwnProperty('breakpoint')){
              this.store.dispatch(new generalActions.updateBreakPoint(this.breakPointInDataWidget.breakpoint));
              await this.chatservice.updateBackEndWithBreakpoint({breakpoint: this.breakPointInDataWidget.breakpoint, creditclan_request_id: this.breakPointInDataWidget.request_id})
            }

            this.store.dispatch(new generalActions.checkLoanProcess("failed"));
            this.kickStartResponse();
        }
      })

      setTimeout(() => {
        this.cc.open();
        button.disabled = false;
        button.innerHTML = 'Continue application';
      }, 200);
      
  }


  async sendLoanRequestToBankEnd(){
    let childArray:Array<Partial<AChild>>, parent: Parent, tuitionFeesTotal: number;
    //  Please refactor this code later
    // get child
    let disconnect1 = this.store
      .select(fromStore.getCurrentChildState)
      .pipe(pluck("child_info"))
      .subscribe(val => {
       childArray = Array.from((val as Map<string, Partial<AChild>>).values())});
      const arrayOfChildId: {id: any, tuition: string}[] = childArray.map(element => {
        return{
          id: element.child_id || element.id,
          tuition: element.tuition_fees || element.tuition,
          uniform: element.hasOwnProperty('uniform') ? element.uniform : null,
          transport: element.hasOwnProperty('transport') ? element.transport : null,
          feeding: element.hasOwnProperty('feeding') ? element.feeding : null
        }
      })
      // get parent
      let disconnect2 =  this.store
    .select(fromStore.getCurrentParentInfo)
    .subscribe(val => {
      parent = val as Parent;
    });

    // get tuition
    let disconnect3 = this.store
      .select(fromStore.getCurrentChildState)
      .subscribe((val: any) => {
        const { total_tuition_fees } = val as ChildrenState;
        tuitionFeesTotal = total_tuition_fees;
      });

      const rf = sessionStorage.getItem('repaymentFrequency');
      const res = await this.chatservice.sendLoanRequest({
      school_id: parent.school_id || 1,
      guardian_id: parent.guardian,
      loan_amount: tuitionFeesTotal.toString(),
      child_data: arrayOfChildId,
      repayment_frequency : rf == 'null' ? '3' : rf
    });
    const updatedParents: Partial<Parent> = {...parent, loan_request: res.request}
    this.store.dispatch(new generalActions.addParents(updatedParents));
    await this.chatservice.fetchWidgetStages(tuitionFeesTotal.toString());
    disconnect1.unsubscribe();
    disconnect2.unsubscribe();
    disconnect3.unsubscribe();
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
    this.smartView.componentToLoad = undefined;
    this.smartView.info = undefined;
  }
}
