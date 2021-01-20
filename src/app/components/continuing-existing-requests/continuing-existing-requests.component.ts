import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Parent, schoolCreditStage } from "src/app/models/data-models";

interface checkWhoIsContinuing {
  phone?: string;
  email?: string;
  PIN?: string;
}

@Component({
  selector: "app-continuing-existing-requests",
  templateUrl: "./continuing-existing-requests.component.html",
  styleUrls: ["./continuing-existing-requests.component.css"]
})
export class ContinuingExistingRequestsComponent implements OnInit, AfterViewInit {
  @Output("previousPage") previousPage = new EventEmitter<string>();
  @Input("previous") previous: any;
  pageViews: string[] = ["", "four-digit-pin"];
  view: "" | "four-digit-pin" = "";
  arrayOfNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11];
  input: string = "";
  response: replyGiversOrReceivers = undefined;
  nextStage: string;
  overlay: boolean = false;
  spinner: boolean = true;
  checkWhoIsTryingToContinue: checkWhoIsContinuing = {};
  confirmPhoneOrEmailForm: FormGroup;
  constructor(
    private generalservice: GeneralService,
    private fb: FormBuilder,
    private chatservice: ChatService
  ) { this.manageGoingBackAndForth = this.manageGoingBackAndForth.bind(this);}

  ngOnInit(): void {
    this.generalservice.nextStageForUser$.subscribe(val => {
      console.log(val);
      this.nextStage = val;
    });
    this.confirmPhoneOrEmailForm = this.fb.group({
      phoneOrEmail: ["", Validators.required]
    });
  }

  ngAfterViewInit(){
    document
      .getElementById("backspace")
      .addEventListener("click", this.manageGoingBackAndForth);
  }

  manageGoingBackAndForth() {
    if (this.view == this.previous) {
      const num = this.pageViews.indexOf(this.previous);
      const ans = this.pageViews[num - 1];
      this.view = ans as any;
      this.previousPage.emit(this.pageViews[this.pageViews.indexOf(ans) - 1]);
      return;
    }
    if (this.previous == "") {
      this.view = "";
      this.previousPage.emit("firstPage");
    } else {
      this.view = this.previous;
    }
  }

  get phoneOrEmail() {
    return this.confirmPhoneOrEmailForm.get("phoneOrEmail");
  }

  collectEntry(): void {
    const { phoneOrEmail } = this.confirmPhoneOrEmailForm.value;
    if (this.generalservice.emailRegex.test(phoneOrEmail)) {
      this.checkWhoIsTryingToContinue.email = phoneOrEmail;
      this.view = "four-digit-pin";
      this.previousPage.emit('');
      return;
    }
    this.checkWhoIsTryingToContinue.phone = phoneOrEmail;
    this.view = "four-digit-pin";
    this.previousPage.emit('');
  }

  checking(command?: "stop"): void {
    if (command) {
      document.querySelector(".checking").classList.remove("working");
      this.overlay = false;
      return;
    }
    this.overlay = true;
    document.querySelector(".checking").classList.add("working");
    // setTimeout(() => {

    // }, 1500);
  }

  enterContentIntoInput(event: Event) {
    const element = event.target as HTMLElement;
    if (element.classList.contains("backspace")) {
      this.input = this.input.substring(0, this.input.length - 1);
      return;
    }
    if (this.input.length < 4) {
      const key = element.textContent.trim();
      this.input += key;
    }
  }

  submitThisUser() {
    // debugger;
    this.checking();
    this.checkWhoIsTryingToContinue.PIN = this.input;
    const formToSubmit = { ...this.checkWhoIsTryingToContinue };
    // console.log(formToSubmit);
    this.chatservice.confirmParentPIN(formToSubmit as any).subscribe(
      val => {
        const {stages} = val;
        const returnVal = this.rearrangeStaInOrderFashion(stages);
        this.checking("stop");
        this.continue(returnVal, val.data);
      },
      (err: HttpErrorResponse) => {
        this.generalservice.errorNotification(`${err.error.message}!`);
        this.checking("stop");
      }
    );
  }

  rearrangeStaInOrderFashion(stages:schoolCreditStage): string{
    const arrangedStages = ['parent_data', 'child_data', 'parent_work_info', 'parent_account_info', 'parent_id_info', "parent_creditcard_info" ];
    let returnVal;
    for(let element of arrangedStages){
      if(stages[element] == 0){
        returnVal = element;
        break;
      }
    }
    return returnVal;
  }

  continue(stage: string, data: Partial<Parent>) {
   
    switch (stage) {
      case "parent_data":
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.response = new replyGiversOrReceivers(
          `I see you previously provided your children's info`,
          "left",
          "",
          ``
        );
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.generalservice.handleFlowController("");
        this.generalservice.responseDisplayNotifier(this.response);
        setTimeout(() => {
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `Are you ready to be connected to a financial institution?`,
            "left",
            "Yes, No Later",
            `connectme, notinterested`,
            "allow"
          );
          const chatbotResponse = new replyGiversOrReceivers(
            `To fund this request, We have partnered with banks on your behalf`,
            "left",
            "",
            ``
          );
          this.generalservice.responseDisplayNotifier(chatbotResponse);
        }, 800);
        break;
      case "child_data":
        this.response = new replyGiversOrReceivers(
          `Thank you for registering, ${data.full_name}`,
          "left",
          "",
          ``
        );
        this.generalservice.handleFlowController("");
        this.generalservice.responseDisplayNotifier(this.response);
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        setTimeout(() => {
          this.generalservice.nextChatbotReplyToGiver = undefined;
          const chatbotResponse = new replyGiversOrReceivers(
            `How would you like to pay?`,
            "left",
            "Instalmental payments, Full Payment",
            `installmental,fullpayment`,
            "prevent"
          );
          this.generalservice.responseDisplayNotifier(chatbotResponse);
        }, 800);
        break;
      case "parent-info":
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        this.generalservice.handleFlowController("");
        this.response = new replyGiversOrReceivers(
          `You haven't registered with this school fees payment service`,
          "left",
          "",
          ``
        );
        this.generalservice.responseDisplayNotifier(this.response);
        setTimeout(() => {
          this.generalservice.nextChatbotReplyToGiver = undefined;
          const nextresponse = new replyGiversOrReceivers(
            "We would like to quickly register you for this school fees payment service?",
            "left",
            "Continue",
            "continue,full_pay",
            "prevent"
          );
          this.generalservice.responseDisplayNotifier(nextresponse);
        }, 500);
        break;
      case "account-info":
        break;
    }
  }
}
