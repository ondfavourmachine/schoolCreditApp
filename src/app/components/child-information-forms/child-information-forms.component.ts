import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StoreService } from "src/app/services/mockstore/store.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { AChild, Parent } from "src/app/models/data-models";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
// import { pluck } from "rxjs/operators";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { ChildrenState } from "src/app/store/reducers/children.reducer";
import { ChatService } from "src/app/services/ChatService/chat.service";

@Component({
  selector: "app-child-information-forms",
  templateUrl: "./child-information-forms.component.html",
  styleUrls: ["./child-information-forms.component.css"]
})
export class ChildInformationFormsComponent implements OnInit, OnDestroy {
  viewToshow:
    | ""
    | "selectChildren"
    | "enterInformation"
    | "modifyOrNot"
    | "summary"
    | "upload-image" = "";
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
  fullpayment: boolean;
  constructor(
    private fb: FormBuilder,
    public mockstore: StoreService,
    private generalservice: GeneralService,
    private store: Store<fromStore.AllState>,
    private chatapi: ChatService
  ) {}

  ngOnInit(): void {
    this.childInfoForm = this.fb.group({
      name: ["", Validators.required],
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
      });

    this.fullpayment = JSON.parse(sessionStorage.getItem("fullpayment"));
    console.log(this.fullpayment);
  }

  addChildPictrue() {
    document.getElementById("picture-upload").click();
  }

  async loadChildImage(event: Event) {
    // const updateChildInfo: Partial<AChild> = {
    //   picture: event.target["files"][0]
    // };
    // this.store.dispatch(new generalActions.addAChild(updateChildInfo));
    this.childPicture = event.target["files"][0];
    let reader: FileReader;
    if (FileReader) {
      reader = new FileReader();
      reader.onload = anevent => {
        (document.querySelector(
          ".modified-img"
        ) as HTMLImageElement).src = `${anevent.target["result"]}`;
      };
      reader.readAsDataURL(event.target["files"][0]);
    }
  }

  selectThis(event: Event) {
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

    const toBeDestroyed: Subscription = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        const { guardian } = val as Parent;
        guardianID = guardian;
      });

    this.chatapi
      .updateChildrenCount({
        guardian: guardianID,
        children_count: p.textContent != "3+" ? parseInt(p.textContent) : 4
      })
      .subscribe(val => toBeDestroyed.unsubscribe());
  }

  get numberOfSelected(): boolean {
    return this.selectedChildren.length < 1;
  }

  startEnteringChildInfo() {
    const number: Number = this.selectedChildren[0];

    for (let i = 1; i <= number; i++) {
      const word = this.fetchWordForNumber(i);
      this.mapOfChildrensInfo.set(word, { index: i });
    }
    if (this.mapOfChildrensInfo.size > 1) {
      this.iterator = this.mapOfChildrensInfo.keys();
      this.currentChild = this.iterator.next().value;
      this.viewToshow = "enterInformation";
      return;
    }
    this.iterator = this.mapOfChildrensInfo.keys();
    this.currentChild = this.iterator.next().value;
    this.viewToshow = "enterInformation";
  }

  fetchWordForNumber(num: number): string {
    const arrayOfWords = [
      "",
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
      "eighth",
      "nineth",
      "Tenth"
    ];
    let returnVal: string;
    arrayOfWords.forEach((element, index, array) => {
      if (index == num) {
        returnVal = array[num];
      }
    });
    return returnVal;
  }

  moveToNextChildOrNot() {
    this.spinner = true;
    let value: Partial<AChild> = { ...this.childInfoForm.value };
    const objectHoldingIndex = this.mapOfChildrensInfo.get(this.currentChild);
    value = {
      ...value,
      picture: this.childPicture,
      index: objectHoldingIndex.index
    };
    this.mapOfChildrensInfo.set(this.currentChild, value);

    // this is necessary
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
    }, 500);
  }

  get nameOfRecentlyAddedChild(): string {
    let len = this.mockstore.childrenInformationSubmittedByParent.length - 1;
    return this.mockstore.childrenInformationSubmittedByParent[len].name;
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
      // console.log(this.mapOfChildrensInfo);
      return;
    }
    this.viewToshow = "enterInformation";
    this.childInfoForm.reset();
  }

  async doneAddingChildren() {
    this.spinner = true;
    this.store.dispatch(new generalActions.addAChild(this.mapOfChildrensInfo));
    this.store.dispatch(new generalActions.calculateFees());
    for (let [key, value] of this.mapOfChildrensInfo) {
      try {
        const res = await this.chatapi.saveChildData(
          { ...value },
          this.guardianID
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
    this.spinner = false;
    if (this.fullpayment) {
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
           this.tuitionFeesTotal
         )}.
         Number of Children: ${this.mapOfChildrensInfo.size}`,
        "left",
        "",
        ``
      );
      this.generalservice.responseDisplayNotifier(responseFromParent);
      this.generalservice.handleFlowController("");
      this.generalservice.handleFlowController("make-full-payment");
      this.fullpayment = false;
      sessionStorage.removeItem("fullpayment");
      return;
    }
    this.generalservice.handleFlowController("");
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
         this.tuitionFeesTotal
       )}.
       Number of Children: ${this.mapOfChildrensInfo.size}`,
      "left",
      "",
      ``
    );

    this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
    this.generalservice.responseDisplayNotifier(responseFromParent);
    let saveToStorage = Array.from(this.mapOfChildrensInfo.entries());
    this.generalservice.setStage("child-info", saveToStorage);
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
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
    this.tuitionFeesTotal = undefined;
    this.mapOfChildrensInfo = new Map();
  }
}
