import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { GeneralService } from "src/app/services/generalService/general.service";
import { AChild, Parent, SchoolClass } from "src/app/models/data-models";
import { pluck, tap } from "rxjs/operators";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { ChildrenState } from "src/app/store/reducers/children.reducer";

type views = "" | "edit-profile-info" | "edit-picture";

@Component({
  selector: "app-edit-child",
  templateUrl: "./edit-child.component.html",
  styleUrls: ["./edit-child.component.css"]
})
export class EditChildComponent implements OnInit, OnDestroy {
  @ViewChild("inputTuition") inputTuition: ElementRef;
  pictureOfChildInEdit: string | File;
  view: views = "";
  childInfoForm: FormGroup;
  destroy: Subscription[] = [];
  listOfChildrenParsed: Map<string, Partial<AChild>> = new Map();
  childTobeEdited: Partial<AChild>;
  listOfClassesInSchool: SchoolClass[] = [];

  parent: Parent;
  currentChildInEdit: string;
  tuitionFeesTotal: number;
  constructor(
    private fb: FormBuilder,
    private store: Store,
    public generalservice: GeneralService,
    private chatservice: ChatService
  ) {}

  ngOnInit(): void {
    const str = sessionStorage.getItem("listOfChildren");
    this.listOfChildrenParsed = JSON.parse(str, this.reviver);
    this.listOfClassesInSchool = JSON.parse(
      sessionStorage.getItem("school_classes")
    );

    this.destroy[0] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        this.parent = val as Parent;
        sessionStorage.setItem("guardian", this.parent.guardian);
      });

    this.destroy[1] = this.store
      .select(fromStore.getCurrentChildState)
      .pipe(
        // tap(val => console.log(val)),
        pluck("child_info")
      )
      .subscribe((val: Map<string, Partial<AChild>>) => {
        if (val.size > 0) {
          const keys = Array.from(val.keys());
          keys.forEach(elem => {
            let obj = { ...val.get(elem) };
            try {
              let obj2 = Object.assign(
                this.listOfChildrenParsed.get(elem),
                obj
              );
              if (this.currentChildInEdit) {
                this.listOfChildrenParsed.set(this.currentChildInEdit, obj2);
              }
            } catch (error) {
              console.log(error);
            }
          });
        }

        // console.log(this.listOfChildrenParsed);
      });

    this.destroy[2] = this.store
      .select(fromStore.getCurrentChildState)
      .subscribe((val: any) => {
        const { total_tuition_fees } = val as ChildrenState;
        this.tuitionFeesTotal = total_tuition_fees;
      });

    this.childInfoForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      class: ["", Validators.required],
      tuition_fees: ["", Validators.required]
    });
  }

  reviver(key, value) {
    if (typeof value === "object" && value !== null) {
      if (value.dataType === "Map") {
        return new Map(value.value);
      }
    }
    return value;
  }

  gotoNextPage(page: views, child) {
    this.currentChildInEdit = child;
    const thischild = this.listOfChildrenParsed.get(this.currentChildInEdit);
    // console.log(thischild);
    this.view = page;
    this.childInfoForm.patchValue({
      first_name: thischild.first_name,
      last_name: thischild.last_name,
      class: thischild.class,
      tuition_fees: thischild.tuition_fees
    });

    this.pictureOfChildInEdit = thischild.picture;
    // console.log(this.pictureOfChildInEdit);
  }

  catchPictureEdited(event: File | string | ArrayBuffer) {
    // console.log(event);
    // console.log(this.listOfChildrenParsed);
    this.handleParentEditedChildInfo(event);
  }

  handleParentEditedChildInfo(event: File | string | ArrayBuffer) {
    let obj = { ...this.listOfChildrenParsed.get(this.currentChildInEdit) };
    obj.picture = event as File;
    for (let elem in this.childInfoForm.value) {
      obj[elem] = this.childInfoForm.value[elem];
    }

    obj.full_name = `${obj.first_name} ${obj.last_name}`;
    this.listOfChildrenParsed.set(this.currentChildInEdit, obj);
    const childEdited = this.listOfChildrenParsed.get(this.currentChildInEdit);
    // console.log(childEdited);

    this.view = "";
    setTimeout(() => {
      this.generalservice.successNotification(
        "Child info has been edited successfully!"
      );
    }, 500);
  }

  async submitEditedChildToServerAndStore() {
     
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `Thank you. Are you ready to make payment now?`,
        "left",
        "Yes I am, I'll do it later, i want to make installmental payments",
        `makefullpayment,notinterested,changepaymenttype`,
        "prevent"
      );
      const chatbotResponse = new replyGiversOrReceivers(
        `I have edited my child's information.`,
        "right"
      );
      this.generalservice.responseDisplayNotifier(chatbotResponse);
      this.generalservice.handleFlowController("");
      sessionStorage.removeItem("fullpayment");
    

    this.makeLoanRequestAndGetLoanOffers();
  }

  async makeLoanRequestAndGetLoanOffers() {
    for (let [key, value] of this.listOfChildrenParsed) {
      try {
        const obj2 = Object.assign({}, value);
        // console.log(obj2)
        await this.chatservice.modifyChildData(value.child_id, obj2);
      } catch (error) {
        console.log(error);
      }
      this.store.dispatch(
        new generalActions.updateAllSingleChildInfo({
          name: key,
          dataToChange: value
        })
      );
      this.store.dispatch(new generalActions.calculateFees());
    }

    if(!sessionStorage.getItem('fullpayment')){
      let childArray = Array.from(this.listOfChildrenParsed.values());
    const arrayOfChildId: { id: any; tuition: string }[] = childArray.map(
      element => {
        return {
          id: element.child_id || element.id,
          tuition: element.tuition_fees || element.tuition,
          uniform: element.hasOwnProperty('uniform') ? element.uniform : null,
          transport: element.hasOwnProperty('transport') ? element.transport : null,
          feeding: element.hasOwnProperty('feeding') ? element.feeding : null
        };
      }
    );
    const rf = sessionStorage.getItem("repaymentFrequency");
    try {
      await this.chatservice.sendLoanRequest({
        school_id: this.parent.school_id || 1,
        guardian_id: this.parent.guardian || sessionStorage.getItem("guardian"),
        loan_amount: this.tuitionFeesTotal.toString(),
        child_data: arrayOfChildId,
        repayment_frequency: rf == "null" ? "3" : rf
      });
      await this.chatservice.fetchWidgetStages(
        this.tuitionFeesTotal.toString()
      );
    } catch (error) {
      console.log(error);
    }
    return;
    }

    let childArray = Array.from(this.listOfChildrenParsed.values());
    const arrayOfChildId: { id: any; tuition: string }[] = childArray.map(
      element => {
        return {
          id: element.child_id || element.id,
          tuition: element.tuition_fees || element.tuition,
          uniform: element.hasOwnProperty('uniform') ? element.uniform : null,
          transport: element.hasOwnProperty('transport') ? element.transport : null,
          feeding: element.hasOwnProperty('feeding') ? element.feeding : null
        };
      }
    );
    const rf = sessionStorage.getItem("repaymentFrequency");
    try {
      await this.chatservice.sendLoanRequest({
        school_id: this.parent.school_id || 1,
        guardian_id: this.parent.guardian || sessionStorage.getItem("guardian"),
        loan_amount: this.tuitionFeesTotal.toString(),
        child_data: arrayOfChildId,
        repayment_frequency: rf == "null" ? "3" : rf
      });
      await this.chatservice.fetchWidgetStages(
        this.tuitionFeesTotal.toString()
      );
    } catch (error) {
      console.log(error);
    }
  }

  userIsDoneEditing() {
    if (sessionStorage.getItem("fullpayment")){
      this.submitEditedChildToServerAndStore();
      return;
    }
    this.makeLoanRequestAndGetLoanOffers();
    sessionStorage.removeItem("listOfChildren");
    sessionStorage.removeItem("editChild");
    this.generalservice.nextChatbotReplyToGiver = undefined;
    const responseFromParent = new replyGiversOrReceivers(
      `I have edited  ${
        this.listOfChildrenParsed.size == 1
          ? "my child's information"
          : "information about my children"
      }!`,
      "right"
    );

    this.generalservice.responseDisplayNotifier(responseFromParent);
    this.generalservice.handleFlowController("");
    setTimeout(() => {
      const responseFromBot = new replyGiversOrReceivers(
        `Thank you for editing your child's information`,
        "left"
      );
      this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `Are you ready to be connected to a financial institution?`,
        "left",
        "Yes, No Later",
        `connectme, notinterested`,
        "allow"
      );
      this.generalservice.responseDisplayNotifier(responseFromBot);
    }, 1000);
  }

  ngOnDestroy() {
    this.destroy.forEach(elem => elem.unsubscribe());
  }
}
