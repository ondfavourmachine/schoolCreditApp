import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef
} from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { debounceTime } from "rxjs/operators";
import { Subscription } from "rxjs";
// import { NotifierService } from "angular-notifier";
import {
  ReceiversResponse,
  replyGiversOrReceivers
} from "src/app/models/GiverResponse";
// import { element } from 'protractor';

interface DetailsToSend {
  parent?: string;
  spouse?: string;
  parentID?: string;
  spouseID?: string;
  familySize?: string;
  bankDetails?: { bankName: string; bankAccountNumber: string };
  familyPicture?: string;
}

@Component({
  selector: "app-know-your-receiver",
  templateUrl: "./know-your-receiver.component.html",
  styleUrls: ["./know-your-receiver.component.css"]
})
export class KnowYourReceiverComponent
  implements OnInit, AfterViewInit, OnDestroy {
  public notification = { show: false, message: undefined };
  public toKYCComponent: {
    nextStage?: string;
    previousStage?: string;
    subStage?: string;
  } = {};

  // public familyMemberSelection: boolean = false;
  public provideIDFirstPerson: boolean = true;
  public provideIDSecondPerson: boolean = true;
  public allowedToShow: boolean = false;

  public familyDetailsInfo: {
    parent?: string;
    sizeOfFamily?: string;
    phoneNumber?: string;
    nameOfPerson?: string;
    occupation?: string;
    idOfParentToProvide?: string;
    spouse?: string;
    idOfSpouseToProvide?: string;
    idOfParentValue?: string;
    idOfSpouseValue?: string;
    spouseHasChosenProvidedID?: boolean;
    nameOfFamilyToDisplay?: string;

    // nameOfIDToproduce?: string;
  } = {};

  private detailsToSendToApi: DetailsToSend = {};
  //  formGroups
  public familyGroupForm: FormGroup;
  public idForm: FormGroup;

  public loading: boolean = true; // this is for the hidden attribute, when true = hide, when false = unhide
  public selectedParent: string = undefined;
  public IdToProvide: string = "BVN";
  public warningForNotProvidingID: boolean = false;

  // htmlElement containers
  translateDiv: HTMLDivElement;
  numberBlockOne: HTMLDivElement;
  numberBlockOneAlt: HTMLDivElement;
  modifiableParagraph: HTMLParagraphElement;
  translateCoverPlateForProvidingID: HTMLDivElement;
  // subStage: string; // 1, 2, 3
  // subscriptions
  destoryPhonenumber: Subscription;
  destroyID: Subscription;

  // disable Input if the boxes havent been selected;
  public noInputAllowed: boolean = true;
  inputingID: boolean;
  constructor(
    private generalservice: GeneralService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.generalservice.commKYC$.subscribe(val => {
      this.toKYCComponent = val;
    });
    this.generalservice.controlGlobalNotificationSubject.next("off");
    this.familyGroupForm = this.fb.group({
      fullname: ["", Validators.required],
      phonenumber: ["", Validators.required],
      occupation: ["", Validators.required]
    });

    this.idForm = this.fb.group({
      id: ["", [Validators.required]]
    });

    this.destoryPhonenumber = this.phonenumber.valueChanges
      .pipe(debounceTime(500))
      .subscribe(val => {
        if (!isNaN(val)) {
          this.phonenumber.patchValue(
            String(val)
              .toString()
              .substring(0, 11)
          );
        }
      });

    this.destroyID = this.id.valueChanges
      .pipe(debounceTime(200))
      .subscribe(val => {
        if (this.IdToProvide.toLowerCase() !== "bvn") {
          return;
        }
        if (!isNaN(val)) {
          this.id.patchValue(
            String(val)
              .toString()
              .substring(0, 11)
          );
        }
      });
  }

  ngAfterViewInit() {
    // this.generalservice.globalOverlay = false;
    this.cd.detectChanges();
  }

  submit(form) {
    console.log("i am here");
    let previousStage = this.toKYCComponent.nextStage;
    this.toKYCComponent = {
      nextStage: "familyDetails",
      previousStage,
      subStage: "numberBlock"
    };
    // this.subStage = "1";
    this.loading = true;
    this.familyDetailsInfo.nameOfPerson = this.fullname.value;
    this.familyDetailsInfo.phoneNumber = this.phonenumber.value;
    this.familyDetailsInfo.occupation = this.occupation.value;
    // console.log(this.familyDetailsInfo);
  }

  submitIdForm(form?: any, checked?: string) {
    //  if(this.pToTrack.nativeElement['textContent'] == '')
    this.allowedToShow = true;
    this.familyDetailsInfo.nameOfPerson = this.fullname.value;
    this.familyDetailsInfo.phoneNumber = this.phonenumber.value;
    this.familyDetailsInfo.occupation = this.occupation.value;
    // console.log(this.familyDetailsInfo);
    this.noInputAllowed = true;
    // this.askForSecondID();
    this.familyDetailsInfo.idOfParentValue = this.id.value;
    if (this.familyDetailsInfo.idOfParentValue) {
      this.moveToNextStageForReceiver();
    }
  }

  public occupationIsRequired() {
    return this.occupation.hasError("required") && this.occupation.touched;
  }

  public phoneIsRequired() {
    return this.phonenumber.hasError("required") && this.phonenumber.touched;
  }

  public fullnameIsRequired() {
    return this.fullname.hasError("required") && this.fullname.touched;
  }

  askForSecondID() {
    if (this.familyDetailsInfo.spouse) {
      this.modifiableParagraph = undefined;
      this.modifiableParagraph = document.querySelector(
        ".modifiableParagraph"
      ) as HTMLParagraphElement;
      this.modifiableParagraph.textContent = `Please provide your other family member's ID`;
      // let classlist: DOMTokenList = this.translateCoverPlateForProvidingID
      //   .classList;
      // let regex = /animationIn/;
      // if (regex.test(classlist.value)) {
      // console.log(true, classlist.value);
      // this.translateCoverPlateForProvidingID.classList.remove("animationIn");
      // this.translateCoverPlateForProvidingID.classList.add("animationOut");
      this.removethickenBorderBottom(".numberBlockOne");
      if (this.familyDetailsInfo.idOfParentValue) {
        this.familyDetailsInfo.idOfSpouseValue = this.id.value;
      } else {
        this.familyDetailsInfo.idOfParentValue = this.id.value;
      }

      // console.log(this.familyDetailsInfo);
      this.id.reset();
      // }
    }
  }

  selectFamilySize(event, size?: string, ifYouWantToGoBack?: string) {
    if (ifYouWantToGoBack) this.toKYCComponent.subStage = ifYouWantToGoBack;
    try {
      const div = (event.srcElement as HTMLElement).closest(".numberBlockOne");
      if (size)
        this.familyDetailsInfo.sizeOfFamily = this.returnApiComplientFamilysize(
          size
        );
      div.classList.add("thickenBorderBottom");
      this.setSpouse();
      // setTimeout(
      //   () =>
      //   700
      //   );
      this.controlDisplayOfNumberBlockAndNumberBlockAlt();
    } catch (e) {
      if (size) this.familyDetailsInfo.sizeOfFamily = size;
      const div = (event.srcElement as HTMLElement).closest(
        ".numberBlockOneAlt"
      );
      this.familyDetailsInfo.parent = div.querySelector("p").textContent;
      this.setSpouse();

      div.classList.add("thickenBorderBottom");
      // setTimeout(() => {
      // }, 1000);
      this.controlDisplayOfNumberBlockAndNumberBlockAlt("animationIn");
      (document.querySelector(".preliminary") as HTMLDivElement).style.display =
        "block";
    }
  }

  controlDisplayOfNumberBlockAndNumberBlockAlt(animation?: string) {
    if (animation) {
      this.controlAnimatedDiv(animation);
      return;
    }
    this.numberBlockOne = document.querySelector(
      ".numberBlock"
    ) as HTMLDivElement;
    this.numberBlockOne.style.display = "none";
    this.numberBlockOneAlt = document.querySelector(
      ".numberBlockAlt"
    ) as HTMLDivElement;
    this.numberBlockOneAlt.style.display = "grid";
    this.modifiableParagraph = document.querySelector(
      ".modifiableParagraph"
    ) as HTMLParagraphElement;
    this.modifiableParagraph.textContent = `Which family
    member are you?`;
  }

  cancelPreliminaryPage() {
    (document.querySelector(".preliminary") as HTMLDivElement).style.display =
      "none";
    let classlist: DOMTokenList = this.translateDiv.classList;
    let regex = /animationIn/;
    if (regex.test(classlist.value)) {
      // console.log(true, classlist.value);
      this.translateDiv.classList.remove("animationIn");
      this.translateDiv.classList.add("animationOut");
      this.removethickenBorderBottom();
    } else {
      console.log(false);
    }
    for (let key in this.familyDetailsInfo) {
      this.familyDetailsInfo[key] = undefined;
    }
  }

  removethickenBorderBottom(selector?: string) {
    const divs: NodeList = selector
      ? document.querySelectorAll(selector)
      : document.querySelectorAll(".numberBlockOneAlt");
    for (let i = 0; i < divs.length; i++) {
      let currentDiv = divs[i] as HTMLDivElement;
      if (currentDiv.classList.contains("thickenBorderBottom")) {
        currentDiv.classList.remove("thickenBorderBottom");
        break;
      }
    }
  }

  checkForAnimationOut(div: HTMLDivElement) {
    if (div.classList.contains("animationOut")) {
      div.classList.remove("animationOut");
    }
  }

  setSpouse() {
    const regex = /father/i;
    if (regex.test(this.familyDetailsInfo.parent)) {
      // console.log(this.familyDetailsInfo);
      this.familyDetailsInfo.spouse = "wife";
      this.familyDetailsInfo.nameOfFamilyToDisplay = "wife";
    } else {
      // console.log(this.familyDetailsInfo);
      this.familyDetailsInfo.spouse = "husband";
      this.familyDetailsInfo.nameOfFamilyToDisplay = "husband";
    }
  }

  controlAnimatedDiv(animation, divToTranslate?: HTMLDivElement) {
    if (divToTranslate) {
      this.checkForAnimationOut(divToTranslate);
      divToTranslate.classList.add(animation);
      divToTranslate.style.display = "block";
    } else {
      this.translateDiv = document.querySelector(
        ".translateCoverPlate"
      ) as HTMLDivElement;
      this.checkForAnimationOut(this.translateDiv);
      this.translateDiv.classList.add(animation);
      this.translateDiv.style.display = "block";
    }
  }

  provideID() {
    // console.log("i am here");
    // this.familyMemberSelection = true;
    // setTimeout(() => {
    // }, 1500);
    this.toKYCComponent = {
      nextStage: "providingID",
      previousStage: "familyDetails",
      subStage: "numberBlock"
    };
    // HACK!!
    // this.translateCoverPlateForProvidingID = document.getElementById(
    //   "translateCoverPlateForProvidingID"
    // ) as HTMLDivElement;
    this.submitIdForm();
    // HACK!!
  }

  selectID(event, ifYouWantToGoBack?: string) {
    this.noInputAllowed = true;
    if (ifYouWantToGoBack) this.toKYCComponent.subStage = ifYouWantToGoBack;
    const div = (event.srcElement as HTMLElement).closest(".numberBlockOne");
    this.unselectElementsSelected("idSelectionDiv", div.textContent);
    this.IdToProvide = div.textContent;
    // console.log(div.textContent);
    div.classList.add("thickenBorderBottom");
    // console.log(this.familyDetailsInfo);
    if (this.familyDetailsInfo.idOfParentToProvide) {
      this.familyDetailsInfo.idOfSpouseToProvide = div.textContent;
      this.noInputAllowed = false;
      console.log(this.familyDetailsInfo);
    } else {
      this.familyDetailsInfo.idOfParentToProvide = div.textContent;
      this.noInputAllowed = false;
      console.log(this.familyDetailsInfo);
    }
    // console.log(this.familyDetailsInfo.idOfParentToProvide);
    this.familyDetailsInfo.spouseHasChosenProvidedID = false;

    if (this.familyDetailsInfo.idOfParentValue) {
      this.familyDetailsInfo.spouseHasChosenProvidedID = true;
    }
    // console.log(this.familyDetailsInfo.idOfParentValue);
    this.translateCoverPlateForProvidingID = document.getElementById(
      "translateCoverPlateForProvidingID"
    ) as HTMLDivElement;
    this.controlAnimatedDiv(
      "animationIn",
      this.translateCoverPlateForProvidingID
    );
    // (document.querySelector(
    //   ".identificationForm"
    // ) as HTMLDivElement).style.display = "block";

    this.inputingID = true;

    setTimeout(
      () => this.controlDisplayOfNumberBlockAndNumberBlockAlt("animationIn"),
      700
    );
  }

  // getters
  get spouse() {
    if (this.familyDetailsInfo.spouse) {
      return this.familyDetailsInfo.spouse;
    }
  }

  get spouseNameToDisplay(): string {
    // console.log(this.familyDetailsInfo);
    return this.familyDetailsInfo.spouse == "husband" ? "wife" : "husband";
  }

  get fullname() {
    return this.familyGroupForm.get("fullname");
  }

  get phonenumber() {
    return this.familyGroupForm.get("phonenumber");
  }

  get occupation() {
    return this.familyGroupForm.get("occupation");
  }

  get id() {
    return this.idForm.get("id");
  }

  moveToNextStageForReceiver() {
    // debugger;
    sessionStorage.setItem(
      "currentState",
      JSON.stringify(this.familyDetailsInfo)
    );
    const response: ReceiversResponse = new ReceiversResponse(
      this.generalservice.typeOfPerson,
      "takeAPicture",
      {
        message: "I have provided information about my family",
        direction: "right",
        button: "",
        extraInfo: undefined
      }
    );
    this.generalservice.nextChatbotReplyToReceiver = new replyGiversOrReceivers(
      "Ok, thank you. Please keep going.",
      "left"
    );
    this.generalservice.controlGlobalNotificationSubject.next("on");
    this.generalservice.responseDisplayNotifier(response);
    // setTimeout(() => {
    // }, 1200);
    this.generalservice.handleFlowController("takeAPicture");
  }

  removeTranslatedPage() {
    this.translateCoverPlateForProvidingID.classList.remove("animationIn");
    this.translateCoverPlateForProvidingID.style.display = "none";
  }

  returnApiComplientFamilysize(size) {
    if (!size) return;
    if (size == "1") return "1";
    else if (size == "2-3") return "2";
    else if (size == "4-6") return "3";
    else if (size == "6+") return "4";
  }

  goBack(nameOfPart?: string, extraInfo?: string) {
    switch (nameOfPart) {
      case "providingID":
        if (this.toKYCComponent.subStage == "numberBlock" && extraInfo) {
          (document.querySelector(
            `.numberBlockAlt`
          ) as HTMLDivElement).style.display = "none";
          (document.getElementById(
            `idSelectionDiv`
          ) as HTMLDivElement).style.display = "grid";
          this.modifiableParagraph.textContent = "Please provide your ID?";
        } else {
          this.removethickenBorderBottom(".numberBlockOneAlt");
          (document.querySelector(
            `.translateCoverPlate`
          ) as HTMLDivElement).style.display = "none";
          (document.querySelector(
            `.numberBlockAlt`
          ) as HTMLDivElement).style.display = "none";
          (document.querySelector(
            `.numberBlock`
          ) as HTMLDivElement).style.display = "grid";
          this.modifiableParagraph.textContent =
            "How many are you in your family?";
        }
        this.familyDetailsInfo.idOfParentToProvide = undefined;
        this.familyDetailsInfo.spouseHasChosenProvidedID = false;
        this.familyDetailsInfo.idOfParentValue = undefined;
        this.familyDetailsInfo.idOfSpouseValue = undefined;
        this.allowedToShow = false;
        break;
      case "familyDetails":
        this.removethickenBorderBottom(".numberBlockOne");
        if (this.toKYCComponent.subStage == "numberBlock") {
          // blockToDisable = this.toKYCComponent.subStage;
          (document.querySelector(
            `.numberBlockAlt`
          ) as HTMLDivElement).style.display = "none";
          (document.querySelector(
            `.numberBlock`
          ) as HTMLDivElement).style.display = "grid";
          this.modifiableParagraph.textContent =
            "How many are you in your family?";
        } else {
          this.removethickenBorderBottom(".numberBlockOneAlt");
          (document.querySelector(
            `.translateCoverPlate`
          ) as HTMLDivElement).style.display = "none";
          (document.querySelector(
            `.numberBlockAlt`
          ) as HTMLDivElement).style.display = "none";
          (document.querySelector(
            `.numberBlock`
          ) as HTMLDivElement).style.display = "grid";
          this.modifiableParagraph.textContent =
            "How many are you in your family?";
        }
        break;
    }
  }

  unselectElementsSelected(selector, textContent) {
    let divs: NodeList = document
      .getElementById(selector)
      .querySelectorAll(".numberBlockOne");
    divs.forEach(element => {
      // element = element as HTMLDivElement
      if (element.textContent !== textContent) {
        (element as HTMLDivElement).classList.remove("thickenBorderBottom");
      }
    });
  }

  iDontHaveAFamilyWithID(event: Event) {
    const input = event.srcElement as HTMLInputElement;
    // if (input.checked && this.familyDetailsInfo.idOfParentValue) {
    if (input.checked) {
      // console.log(this.familyDetailsInfo);
      this.moveToNextStageForReceiver();
    } else {
      this.notification.show = true;
      this.notification.message = "You must provide an ID";
    }
    setTimeout(() => {
      this.notification.show = false;
      this.notification.message = undefined;
    }, 2000);
  }

  noIDToProvide() {
    // this.translateDiv = document.querySelector(
    //   "#idWarning"
    // ) as HTMLDivElement;
    // this.translateDiv.style.display = "block";

    // (document.querySelector("#idWarning .preliminary") as HTMLDivElement).style.display =
    //   "block";

    // const increaseHeight = document.getElementById(
    //   "increaseHeight"
    // ) as HTMLDivElement;
    // increaseHeight.style.height = "550px";
    this.warningForNotProvidingID = true;
  }

  takeOfwarning() {
    // const increaseHeight = document.getElementById(
    //   "increaseHeight"
    // ) as HTMLDivElement;
    // increaseHeight.style.height = "auto";
    this.warningForNotProvidingID = false;
    const cbox = document.getElementById('noId') as HTMLInputElement;
    if (cbox) cbox.checked = false;
  }

  continueWithoutID() {
    // const increaseHeight =  document.getElementById('increaseHeight') as HTMLDivElement;
    this.moveToNextStageForReceiver();
    this.generalservice.userDidNotProvideID = true;
  }

  ngOnDestroy() {
    // this.destoryPhonenumber.unsubscribe();
    // this.destroyID.unsubscribe();
  }
}
