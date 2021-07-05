import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TeacherDetails, TeacherOffer } from 'src/app/models/data-models';
import { replyGiversOrReceivers } from 'src/app/models/GiverResponse';
import { GeneralService } from 'src/app/services/generalService/general.service';
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import { pluck, tap } from "rxjs/operators";
import { ChatService } from 'src/app/services/ChatService/chat.service';

@Component({
  selector: 'app-teacher-loan-application',
  templateUrl: './teacher-loan-application.component.html',
  styleUrls: ['./teacher-loan-application.component.css']
})
export class TeacherLoanApplicationComponent implements OnInit {
  @Output("previousPage") previousPage = new EventEmitter<string>();
  @Input("previous") previous: any;
 page : 'selection' | 'address' | 'offer' | 'widget' | '' = 'selection'; 
 cc: any;
 teacherInfo: Partial<TeacherDetails> = {};
 selectedOffer: Partial<TeacherOffer> = {}
 school_id: any;
 submittingOffer: boolean = false;
 pageViews: string[] = [
  "",
  "selection",
  "address",
  "offer"
];
 
 reqPayload: any = {};
 offersFromCreditClan: TeacherOffer[] = [];
  constructor(
    private chatservice: ChatService,
    private generalservice: GeneralService,private store: Store ) 
    { 
      this.manageGoingBackAndForth = this.manageGoingBackAndForth.bind(this);
    }


    manageGoingBackAndForth() {
      if (this.page == this.previous) {
        const num = this.pageViews.indexOf(this.previous);
        const ans = this.pageViews[num - 1];
        this.page = ans as any;
        // this.previousPage.emit(this.pageViews[this.pageViews.indexOf(ans) - 1]);
        this.page == 'selection' ? this.previousPage.emit('firstPage') : this.previousPage.emit(this.pageViews[this.pageViews.indexOf(ans) - 1]);

        return;
      }
      if (this.previous == "") {
        this.page = "";
        this.previousPage.emit("firstPage");
        this.page = "";
      } else {
        this.page = this.previous;
        this.page == 'selection' ? this.previousPage.emit('firstPage') : null;
      }
    }


  ngOnInit(): void {
    this.store.select(fromStore.getSchoolDetailsState)
    .pipe(tap(val =>  {this.school_id = val["school_Info"].id})).subscribe();
    this.store.select(fromStore.teacherDetailsState)
    .pipe(
      pluck('teacher_Info')
    )
    .subscribe(
      (val: Partial<TeacherDetails>) => {
        this.teacherInfo = val;
        this.offersFromCreditClan = this.teacherInfo.offers;
        this.offersFromCreditClan = this.offersFromCreditClan.map(
          elem => {
           return  {duration: elem.duration,
             monthly_amount: new Intl.NumberFormat().format(Math.round(elem.monthly_amount as number)),
             principal: new Intl.NumberFormat().format(Math.round(elem.principal as number)),
             total_repayment: elem.total_repayment
              }
            }
        );
      }
    )
  }

  ngAfterViewInit() {
    document
      .getElementById("backspace")
      .addEventListener("click", this.manageGoingBackAndForth);
  }


 async endOfLoanApplicationProcess(){
   this.submittingOffer = true;
    const res = await this.chatservice.getCreditClanRequestIdForTeachers(this.reqPayload);
    const {school_id, teacher_id} = this.reqPayload;
    const {principal} = this.selectedOffer;
    const {request_id} = res;
    const formToSubmit = {school_id, loan_amount: (principal as string).split(',').join(''), teacher_id};
    const secondRes = await this.chatservice.sendTeacherAcceptedLoansToBackend(formToSubmit);
    await this.chatservice.updateTeacherIDWithCreditclanId(request_id, secondRes.data.id);
    this.preInitiationToDataCollectionWidget(secondRes.data.id);
    // this.generalservice.handleFlowController("");
    //      const chatbotResponse = new replyGiversOrReceivers(
    //         `Thank you for showing interest in School Credit. Your request has been sent to the school for confirmation.`,
    //         "left",
    //         ``,
    //         ``,
    //         "allow"
    //       )

    //       this.generalservice.responseDisplayNotifier(chatbotResponse);
    //       this.submittingOffer = false;
  }

  selectAnOffer(teacherOffer){
    this.page = 'address';
    this.selectedOffer = teacherOffer;
    this.previousPage.emit('selection');
   }

  async receivedAddress(event){
    
    this.reqPayload = {home_address: {address: event.address, state: event.state, lga:event.lga}}
    this.reqPayload['school_id'] = this.school_id,
    this.reqPayload['teacher_id'] = this.teacherInfo.id;
    this.reqPayload['profile'] = {fullname: this.teacherInfo.name, phone: this.teacherInfo.phone};
    this.reqPayload['request'] = {amount: this.selectedOffer.principal, duration: this.selectedOffer.duration};
    const res = await this.chatservice.getTeacherSummaryPage(this.reqPayload);
     this.selectedOffer['first_repayment_date'] = res.data.first_repayment_date;
     this.page = 'offer';
    this.previousPage.emit('address');
    // this.preInitiationToDataCollectionWidget();
  }



  async preInitiationToDataCollectionWidget(reqId: any, button?: HTMLButtonElement){
    // this.page = 'widget';
    let teacher: any;
    this.previousPage.emit('address');
    const CreditClan = window['EligibilityWidget'];
    console.log(this.reqPayload);
    this.store.select(fromStore.teacherDetailsState).pipe(pluck('teacher_Info')).subscribe(
      val => teacher = val,
    );
    console.log(teacher, reqId)
    
 
    // const schoolSubscription = this.store.select(fromStore.getSchoolDetailsState).pipe(tap(val =>  {school_id = val["school_Info"].id})).subscribe();
    // const teacher = this.store.select(fromStore.teacherDetailsState).pipe(pluck('teacher_Info'),tap(val => val['id'])).subscribe()
     const data = {
                  banner: 'https://images.unsplash.com/photo-1605902711834-8b11c3e3ef2f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                  // request: { amount: totalFees, tenor: 3 },
                  profile: {
                      // profile_image: pictureForWidget,
                      full_name: this.reqPayload.profile.full_name,
                      // email: this.parentDetails.email,
                      phone: this.reqPayload.profile.phone,
                      // date_of_birth: this.parentDetails.date_of_birth,
                      // gender: this.parentDetails.gender == "1" ? "0" : "1",
                      marital_status: "",
                      nationality: "", //
                      // state_of_origin: this.reqPayload.home_address.state // pass the id of state you collected
                  },
                  request_id: reqId,
                  // stage: 1
                  config: {
                    no_frequently_called_numbers: 0, // Set to 0 if not needed, Max is 2
                    analyze_bank_statement: false,
                    tokenize_card: false,
                    show_offers: false
                  },
                  home_address: {
                    address: this.reqPayload.home_address.address,
                    state_id: this.reqPayload.home_address.state,
                    lga_id: this.reqPayload.home_address.lga
                  },
                  extra: {
                    school_id: this.reqPayload.school_id,
                    // parent_id: this.parentDetails.guardian,
                    teacher_id: this.reqPayload.teacher_id
                  }
          };

        // console.log(data);
       this.cc = CreditClan.init({
         data,
         onReady: async () => {
          // this.spinner = true;
          this.submittingOffer = false;
        },

        onRequest: async ({ request_id, user_id, offer }) => {
            console.log(request_id, user_id, offer);
            // const loanRequest = {
            //   creditclan_request_id: request_id,
            //   eligible: true
            // };
           

            this.generalservice.handleFlowController("");
            const responseFromParent = new replyGiversOrReceivers(
              `I have provided all relevant information`,
              "right"
            );
           
            
            this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
            this.generalservice.responseDisplayNotifier(responseFromParent);
           const chatbotResponse = new replyGiversOrReceivers(
              `Thank you for showing interest in School Credit. Your request has been sent to the school for confirmation.`,
              "left",
              ``,
              ``,
              "allow"
            )
  
            this.generalservice.responseDisplayNotifier(chatbotResponse);
            this.submittingOffer = false;
        },

        onBreakpoint: async (data) =>{
          console.log(data);
        },

        onCancel : async () => {
          //  if the user cancels the widget / clicks the close button
          // update Nebechi of the breakpoint in whihc the user left.
            console.log("Cancel..");

            this.generalservice.handleFlowController("");
            const responseFromParent = new replyGiversOrReceivers(
              `I have provided all relevant information`,
              "right"
            );
           
            
            this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
            this.generalservice.responseDisplayNotifier(responseFromParent);
           const chatbotResponse = new replyGiversOrReceivers(
              `Thank you for showing interest in School Credit. Your request has been sent to the school for confirmation.`,
              "left",
              ``,
              ``,
              "allow"
            )
  
            this.generalservice.responseDisplayNotifier(chatbotResponse);
            this.submittingOffer = false;
           
        }
      })

      setTimeout(() => {
        this.cc.open();
        // button.disabled = false;
        // button.innerHTML = 'Continue application';
      }, 200);
      
  }
 

}
