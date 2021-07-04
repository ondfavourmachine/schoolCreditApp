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
 page : 'selection' | 'address' | 'offer' | '' = 'selection'; 
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
    this.generalservice.handleFlowController("");
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
     this.selectedOffer['first_repayment_date'] = res.data.first_repayment_date
    this.page = 'offer';
    this.previousPage.emit('address');

  }


 

}
