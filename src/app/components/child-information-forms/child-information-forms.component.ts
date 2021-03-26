import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StoreService } from "src/app/services/mockstore/store.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { AChild, Parent, SchoolBook, SchoolBookStructure, SchoolClass } from "src/app/models/data-models";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
// import { pluck } from "rxjs/operators";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { ChildrenState } from "src/app/store/reducers/children.reducer";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { pluck, tap } from "rxjs/operators";

@Component({
  selector: "app-child-information-forms",
  templateUrl: "./child-information-forms.component.html",
  styleUrls: ["./child-information-forms.component.css"]
})
export class ChildInformationFormsComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Output("previousPage") previousPage = new EventEmitter<string>();
  @Input("back") back: any;
  @ViewChild('inputForTuition') inputForTuition: ElementRef
  schoolID: string
  viewToshow:
    | ""
    | "selectChildren"
    | "enterInformation"
    | "modifyOrNot"
    | "summary"
    | "upload-image" | 'select-books' = "";
  pageViews: string[] = [
    "",
    "selectChildren",
    "enterInformation",
    // "email",
    // "activate-email",
    "upload-image"
  ];
  selected: string = "";
  selectedChildren: Array<number> = [];
  mapOfChildrensInfo: Map<string, Partial<AChild>> = new Map();
  currentChild: string;
  iterator: Iterator<any>;
  childInfoForm: FormGroup;
  spinner: boolean = false;
  previous: string;
  currentKey: number;
  destroy: Subscription[] = [];
  tuitionFeesTotal;
  guardianID: string;
  childPicture: File;
  base64FormOfPicture: string | ArrayBuffer;
  fullpayment: boolean;
  numberOfSchoolBooks: number = 0;
  totalCostOfSchoolBooks: number = 0;
  parentDetails: Partial<Parent>
  schoolClasses: SchoolClass[] = [];
  constructor(
    private fb: FormBuilder,
    public mockstore: StoreService,
    private generalservice: GeneralService,
    private store: Store<fromStore.AllState>,
    private chatapi: ChatService
  ) {
    this.manageGoingBackAndForth = this.manageGoingBackAndForth.bind(this);
  }

  manageGoingBackAndForth() {
    if (this.viewToshow == this.back) { 
      const num = this.pageViews.indexOf(this.back);
      const ans = this.pageViews[num - 1];
      this.generalservice.handleSmartViewLoading({component: 'child-information-forms', info: 'childForms'})
      this.viewToshow = ans as any;
      if(ans == ''){
        this.previousPage.emit("firstPage");
        return;
      }
      // ans == "" ?  : "";
      let secondNum = this.pageViews.indexOf(ans);
      this.back = this.pageViews[secondNum - 1];
      return;
    }
    if (this.back == "") {
      this.viewToshow = "";
      this.previousPage.emit("firstPage");
      this.selected = undefined;
      this.generalservice.handleSmartViewLoading({component: 'child-information-forms', info: 'childForms'})
      this.mapOfChildrensInfo = new Map();
      
    } else {
      this.generalservice.handleSmartViewLoading({component: 'child-information-forms', info: 'childForms'})
      this.viewToshow = this.back;
      
    }
  }

  ngOnInit(): void {
    this.previousPage.emit('firstPage');
    this.childInfoForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ['', Validators.required],
      class: ["", Validators.required],
      tuition_fees: ["", Validators.required]
    });

    this.destroy[0] = this.store
      .select(fromStore.getCurrentChildState)
      .subscribe((val: any) => {
        const { total_tuition_fees } = val as ChildrenState;
        this.tuitionFeesTotal = total_tuition_fees;
      });

    this.destroy[1] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        const { guardian } = val as Parent;
        this.guardianID = guardian;
        sessionStorage.setItem('guardian', this.guardianID)
      });

    this.destroy[2] = this.store
      .select(fromStore.getCurrentChildInfo)
      .subscribe();

    //  this.destroy[2] = this.store
    //   .select(fromStore.getCurrentChildState)
    //   .subscribe(val => {
    //     console.log(val);
    //   });

    this.destroy[3] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        this.parentDetails = val as Parent;
      });



    this.fullpayment = JSON.parse(sessionStorage.getItem("fullpayment"));
    this.destroy[4]= this.store.select(fromStore.getSchoolDetailsState)
    .pipe(tap(val => {
      this.schoolID = val['school_Info'].id;
    }),  pluck('school_books')).subscribe((val: SchoolBook[]) => {
      // console.log(val);
      (val as Array<any>).length > 0 ? this.numberOfSchoolBooks = val.length : this.numberOfSchoolBooks = 0;
    })

    this.destroy[6] = this.store.select(fromStore.getSchoolDetailsState)
    .pipe(pluck('school_Info', 'classes'))
    .subscribe((val: Array<SchoolClass>) => this.schoolClasses = val);

  //  reset everything in this component;
    this.destroy[7] = this.generalservice.reset$.subscribe(
      (val: string) => {
        if (val.length < 1) return;
        this.childInfoForm.reset();
        this.fullpayment = false;
        sessionStorage.removeItem("fullpayment");
        this.viewToshow = '';
        this.previousPage.emit("firstPage");
        this.selected = "";
        this.selectedChildren = [];
        this.mapOfChildrensInfo = new Map();
        this.currentChild = undefined;
        this.tuitionFeesTotal = undefined;
        this.guardianID = undefined;
        this.childPicture = undefined;
        this.base64FormOfPicture = undefined;
        this.iterator = undefined;
        this.numberOfSchoolBooks = 0;
        this.totalCostOfSchoolBooks = 0;
        this.parentDetails = undefined;
        this.schoolClasses = [];
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.nextChatbotReplyToReceiver = undefined;
        sessionStorage.removeItem('school_avatar');
        sessionStorage.removeItem('childPicture');
      }
    )
  }

  ngAfterViewInit() {
    document
      .getElementById("backspace")
      .addEventListener("click", this.manageGoingBackAndForth);
  }

  addChildPictrue() {
    document.getElementById("picture-upload").click();
  }

  async loadChildImage(event: Event) {
    this.childPicture = event.target["files"][0];
    let reader: FileReader;
    if (FileReader) {
      reader = new FileReader();
      reader.onload = anevent => {
        (document.querySelector(
          ".modified-img"
        ) as HTMLImageElement).src = `${anevent.target["result"]}`;
        this.base64FormOfPicture = anevent.target.result;
      };
      reader.readAsDataURL(event.target["files"][0]);
    }
  }

  saveChildPictureFromPictureComp(event: File){
    this.childPicture = event;
  }

 
  selectThis(event: Event) {
    // debugger;
    let guardianID;
    const p =
      event.target instanceof HTMLImageElement
        ? event.target.nextElementSibling
        : (event.target as HTMLElement).querySelector(".bolded");
    this.selected = p.textContent;

    p.textContent != "3+"
      ? this.selectedChildren.length == 0
        ? this.selectedChildren.push(+p.textContent)
        : this.selectedChildren.splice(0, 1, +p.textContent)
      : "";

    guardianID = this.fetchGuardianId();
    
    this.chatapi
      .updateChildrenCount({
        guardian: guardianID || sessionStorage.getItem('guardian'),
        children_count: p.textContent != "3+" ? parseInt(p.textContent) : 4
      })
      .subscribe();
      // console.log(this.selectedChildren);
      this.startEnteringChildInfo();
  }

  fetchGuardianId(): any{
    let guardianID;
    const toBeDestroyed: Subscription = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        const { guardian } = val as Parent;
        guardianID = guardian;
      });
    toBeDestroyed.unsubscribe()
    return guardianID;
  }

  get numberOfSelected(): boolean {
    return this.selectedChildren.length < 1;
  }

  startEnteringChildInfo() {
    const number: Number = this.selectedChildren[0];

    for (let i = 1; i <= number; i++) {
      const word = this.generalservice.fetchWordForNumber(i);
      this.mapOfChildrensInfo.set(word, { index: i });
    }
    if (this.mapOfChildrensInfo.size > 1) {
      this.iterator = this.mapOfChildrensInfo.keys();
      this.currentChild = this.iterator.next().value;
      this.viewToshow = "enterInformation";
      this.previousPage.emit("selectChildren");
      return;
    }
    this.iterator = this.mapOfChildrensInfo.keys();
    this.currentChild = this.iterator.next().value;
    this.viewToshow = "enterInformation";
    this.previousPage.emit("selectChildren");
  }

 

  moveToNextChildOrNot(schoolBooks?: Array<SchoolBook>) {
    this.spinner = true;
    let recalibrated = this.childInfoForm.value.tuition_fees.split(',').join('');
    this.childInfoForm.value.tuition_fees = recalibrated;
    let value: Partial<AChild> = { ...this.childInfoForm.value };
    const objectHoldingIndex = this.mapOfChildrensInfo.get(this.currentChild);
    value = {
      ...value,
      full_name: `${value.first_name} ${value.last_name}`,
      picture: this.childPicture,
      index: objectHoldingIndex.index,
      child_book : schoolBooks ? schoolBooks : [],
      total_cost_of_books: objectHoldingIndex.total_cost_of_books
    };
    // console.log(value);
    this.mapOfChildrensInfo.set(this.currentChild, value);
    if (this.mockstore.childrenInformationSubmittedByParent.length < 1) {
      this.mockstore.childrenInformationSubmittedByParent.push(
        this.mapOfChildrensInfo.get(this.currentChild)
      );
    } else {
      const index = value.index;
      const foundIndex = this.mockstore.childrenInformationSubmittedByParent.findIndex(
        element => element.index == index
      );
      foundIndex == -1
        ? this.mockstore.childrenInformationSubmittedByParent.push(
            this.mapOfChildrensInfo.get(this.currentChild)
          )
        : this.mockstore.childrenInformationSubmittedByParent.splice(
            foundIndex,
            1,
            this.mapOfChildrensInfo.get(this.currentChild)
          );
    }

    this.previous = this.currentChild;
    this.currentChild = this.iterator.next().value;
    // this.iterator.next.value might be null sometimes so we do this:
    if (!this.currentChild) {
      const thisindex = this.mapOfChildrensInfo.get(this.previous).index + 1;
      //  this condition should only run if thisindex is less than or equal to the size of the map
      if (thisindex <= this.mapOfChildrensInfo.size) {
        for (let entry of this.mapOfChildrensInfo.entries()) {
          entry[1].index == thisindex ? (this.currentChild = entry[0]) : "";
        }
      }
      // else {
      //   console.log("i am here");
      //   console.log(this.mapOfChildrensInfo);
      // }
    }
    setTimeout(() => {
      this.viewToshow = "modifyOrNot";
      this.spinner = false;
      this.previousPage.emit("");
    }, 200);
  }

  get nameOfRecentlyAddedChild(): string {
    let len = this.mockstore.childrenInformationSubmittedByParent.length - 1;
    return this.mockstore.childrenInformationSubmittedByParent[len].full_name;
  }

  modifyPreviouslyEnteredChildInfo() {
    let thisChild = this.previous;
    this.viewToshow = "enterInformation";
    let currentChildForm = this.mapOfChildrensInfo.get(thisChild);
    this.currentChild = this.previous;
    this.previous = "";
    this.childInfoForm.patchValue(currentChildForm);
  }

  onToNextChild(value: string) {
    if (value.trim().toLowerCase() == "next") {
      this.viewToshow = "summary";
      return;
    }
    this.viewToshow = "enterInformation";
    this.childInfoForm.reset();
    this.base64FormOfPicture = '';
  }

  async doneAddingChildren() {
    this.spinner = true;
    this.store.dispatch(new generalActions.addAChild(this.mapOfChildrensInfo));
    this.store.dispatch(new generalActions.calculateFees());

    for (let [key, value] of this.mapOfChildrensInfo) {
      let formToSubmit = Object.assign({}, value);
      delete formToSubmit.first_name;
      delete formToSubmit.last_name
      try {
        const res = await this.chatapi.saveChildData(
          formToSubmit,
          this.guardianID || sessionStorage.getItem('guardian'),
          this.schoolID
        );
        const { child } = res;
        if (res.message == "child info saved!") {
          this.store.dispatch(
            new generalActions.modifyIndividualChild({
              name: key,
              dataToChange: { child_id: child }
            })
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    let total = 0;
    this.mapOfChildrensInfo.forEach((element, key, map) => {
      total += element.total_cost_of_books;
    })
    this.totalCostOfSchoolBooks = isNaN(total) ? 0 : total;
    // console.log(this.tuitionFeesTotal);
    // console.log(this.totalCostOfSchoolBooks);
    // console.log(this.totalCostOfSchoolBooks + this.tuitionFeesTotal);

    if (this.fullpayment) {
      await this.chatapi.registerParentForFullPayment({guardian_id: this.parentDetails.guardian, payment_type: 2})
      const responseFromParent = new replyGiversOrReceivers(
        `I have provided my ${
          this.mapOfChildrensInfo.size == 1
            ? "child's information"
            : "information about my children"
        }!`,
        "right"
      );
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `Summary :
         You entered a total of ₦${new Intl.NumberFormat().format(
           this.tuitionFeesTotal + this.totalCostOfSchoolBooks
         )} which includes cost of school fees and books.
         Number of Children: ${this.mapOfChildrensInfo.size}`,
        "left",
        "",
        ``
      );
      this.generalservice.responseDisplayNotifier(responseFromParent);
      this.generalservice.handleFlowController("");
      // this.generalservice.handleFlowController("make-full-payment");
      this.fullpayment = false;
      sessionStorage.removeItem("fullpayment");
      setTimeout(() => {
        this.generalservice.nextChatbotReplyToGiver = undefined;
        const chatbotResponse = new replyGiversOrReceivers(
          `Are you ready to make payment now?`,
          "left",
          "Yes I am, I'll do it later, i want to make installmental payments",
          `makefullpayment,notinterested,changepaymenttype`,
           undefined
          );
        this.generalservice.responseDisplayNotifier(chatbotResponse);
        this.viewToshow = "";
        this.previousPage.emit("firstPage");
      }, 800);
      this.spinner = false;
      return;
    }

      this.notifyBackendOfLoanRequest();
      await this.chatapi.fetchWidgetStages(this.tuitionFeesTotal);
    this.spinner = false;
    this.previousPage.emit("firstPage");
    
    this.generalservice.handleFlowController("");
    const responseFromParent = new replyGiversOrReceivers(
      `I have provided my ${
        this.mapOfChildrensInfo.size == 1
          ? "child's information"
          : "information about my children"
      }!`,
      "right"
    );
    // console.log(this.tuitionFeesTotal);
    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Summary :
       You entered a total of ₦${new Intl.NumberFormat().format(
         this.tuitionFeesTotal + this.totalCostOfSchoolBooks
       )} which includes cost of school fees ${this.totalCostOfSchoolBooks > 0 ? ' and books': ''}.
       Number of Children: ${this.mapOfChildrensInfo.size}`,
      "left",
      "",
      ``
    );

    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    this.generalservice.responseDisplayNotifier(responseFromParent);
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
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `Are you ready to be connected to a financial institution?`,
            "left",
            "Yes, No Later",
            `connectme, notinterested`,
            "prevent"
          );
      this.generalservice.responseDisplayNotifier(chatbotResponse);
      this.viewToshow = "";
      this.previousPage.emit("firstPage");
    }, 800);
  }

  showBookSelectionPage(){

    if(this.numberOfSchoolBooks > 0){
      this.generalservice.handleSmartViewLoading({component : 'school-books', info: 'schoolBooks'});
      this.viewToshow = 'select-books'
    }
    else {this.moveToNextChildOrNot()};
    this.previousPage.emit("upload-image");
  }

  childBooksHasBeenAdded(event: Array<SchoolBook>){
    // debugger;
    this.mapOfChildrensInfo.get(this.currentChild).total_cost_of_books = 0;
    let total = 0;
    total = event.reduce((acc, book, index, arr)=> {
      let tuition = book.price.split('.')[0]
      acc += parseInt(tuition);
      return acc;
    }, total)
    // console.log(total);
    this.mapOfChildrensInfo.get(this.currentChild).total_cost_of_books+= total;
    this.generalservice.handleSmartViewLoading({component: 'child-information-forms', info: 'childForms'});
    this.moveToNextChildOrNot(event);
  }

  parentWantsToAddMoreChildren(){
    let newNumberOfChildren = this.mapOfChildrensInfo.size;
    newNumberOfChildren = newNumberOfChildren + 1
    const word = this.generalservice.fetchWordForNumber(newNumberOfChildren);
    this.mapOfChildrensInfo.set(word, { index: newNumberOfChildren });
    this.currentChild = word;
    const guardianID = this.fetchGuardianId();
    this.childInfoForm.reset();
    this.base64FormOfPicture = '';
    this.viewToshow = "enterInformation";
    this.chatapi
      .updateChildrenCount({
        guardian: guardianID || sessionStorage.getItem('guardian'),
        children_count: newNumberOfChildren
      })
      .subscribe();
  }

  async notifyBackendOfLoanRequest(){
    let childArray:Array<Partial<AChild>>
    this.destroy[5] = this.store
      .select(fromStore.getCurrentChildState)
      .pipe(pluck("child_info"))
      .subscribe(val => {
       childArray = Array.from((val as Map<string, Partial<AChild>>).values())});
      const arrayOfChildId: {id: any, amount: string}[] = childArray.map(element => {
        return{
          id: element.child_id || element.id,
          amount: element.tuition_fees
        }
      })
      const rf = sessionStorage.getItem('repaymentFrequency');
      const res = await this.chatapi.sendLoanRequest({
      school_id: this.parentDetails.school_id || 1,
      guardian_id: this.parentDetails.guardian,
      loan_amount: this.tuitionFeesTotal as string,
      child_data: arrayOfChildId,
      repayment_frequency : rf == 'null' ? '3' : rf
    });
    const updatedParents: Partial<Parent> = {...this.parentDetails, loan_request: res.request}
    this.store.dispatch(new generalActions.addParents(updatedParents));
  }

  makeReadable(value: string){
    const correctedValue = value.split(',').join('');
    const newValue = new Intl.NumberFormat().format(Number(correctedValue));
    (this.inputForTuition.nativeElement as HTMLInputElement).value = newValue;
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
    this.tuitionFeesTotal = undefined;
    this.mapOfChildrensInfo = new Map();
    document
      .getElementById("backspace")
      .removeEventListener("click", this.manageGoingBackAndForth);
  }
}
