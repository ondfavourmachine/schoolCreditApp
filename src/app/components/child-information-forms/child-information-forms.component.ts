import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StoreService } from "src/app/services/mockstore/store.service";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";

@Component({
  selector: "app-child-information-forms",
  templateUrl: "./child-information-forms.component.html",
  styleUrls: ["./child-information-forms.component.css"]
})
export class ChildInformationFormsComponent implements OnInit {
  viewToshow:
    | ""
    | "selectChildren"
    | "enterInformation"
    | "modifyOrNot"
    | "summary" = "";
  selected: string = "";
  selectedChildren: Array<number> = [];
  mapOfChildrensInfo: Map<
    string,
    { name?: string; class?: string; tuition_fees?: any; index?: number }
  > = new Map();
  currentChild: string;
  iterator: Iterator<any>;
  childInfoForm: FormGroup;
  spinner: boolean = false;
  previous: string;
  currentKey: number;
  constructor(
    private fb: FormBuilder,
    public mockstore: StoreService,
    private generalservice: GeneralService
  ) {}

  ngOnInit(): void {
    this.childInfoForm = this.fb.group({
      name: ["", Validators.required],
      class: ["", Validators.required],
      tuition_fees: ["", Validators.required]
    });
  }

  selectThis(event: Event) {
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
    let value = { ...this.childInfoForm.value };
    const objectHoldingIndex = this.mapOfChildrensInfo.get(this.currentChild);
    value = { ...value, index: objectHoldingIndex.index };
    this.mapOfChildrensInfo.set(this.currentChild, value);
    // console.log(this.mapOfChildrensInfo);
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

  doneAddingChildren() {
    // this.generalservice.handleFlowController('');
    // console.log(this.mockstore.childrenInformationSubmittedByParent);
    let total = this.mockstore.childrenInformationSubmittedByParent.reduce(
      (acc, current, currentIndex, array) => {
        return acc + +current.tuition_fees;
      },
      0
    );
    // console.log(total);
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
       You entered a total of ₦${new Intl.NumberFormat().format(total)}
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
}
