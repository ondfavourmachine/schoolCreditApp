import { Component, OnInit } from '@angular/core';
import { replyGiversOrReceivers } from 'src/app/models/GiverResponse';
import { GeneralService } from 'src/app/services/generalService/general.service';

@Component({
  selector: 'app-teacher-loan-application',
  templateUrl: './teacher-loan-application.component.html',
  styleUrls: ['./teacher-loan-application.component.css']
})
export class TeacherLoanApplicationComponent implements OnInit {
 page : 'selection' | 'address' | 'offer' = 'selection'; 
  constructor(private generalservice: GeneralService, ) { }

  ngOnInit(): void {
  }


  endOfLoanApplicationProcess(){
    //  send loan request to soji
    // get response containing creditclan_request_id 
    // send to nebechi
    this.generalservice.handleFlowController("");
          // this.spinner = false;
         const chatbotResponse = new replyGiversOrReceivers(
            `Thank you, we will get back to you.`,
            "left",
            ``,
            ``,
            "allow"
          )

          this.generalservice.responseDisplayNotifier(chatbotResponse);
  }

}
