import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  AfterViewInit
} from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { replyGiversOrReceivers } from "src/app/models/GiverResponse";
import { Parent, ParentRegistration } from "src/app/models/data-models";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { catchError, debounceTime, map, pluck } from "rxjs/operators";
import { LgaData } from "src/app/models/lgaData";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
  AsyncValidatorFn
} from "@angular/forms";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { Observable, Subscription } from "rxjs";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { sandBoxData } from "src/app/models/sandboxData";
import { of } from "rxjs";

interface State {
  id: string;
  value: string;
}

interface LGA extends State {}

// const validateEmailIsUnique = (apiservice: ChatService, regex: RegExp,
//   obj: ParentsInformationComponent): AsyncValidatorFn => (control: AbstractControl): Promise<{emailExists: boolean}> | Observable<{emailExists: boolean}> | null => {
//   obj.checkingUniqueness = 'checking';
//   if(!control && control.value.length < 2 && !regex.test(control.value)) {
//     obj.checkingUniqueness = 'done';
//     return of(null)
//   };
//      return apiservice.checkEmailUniqueness({email: control.value})
//       .pipe(map(val => {
//         if(val.message.includes('The email has already been taken')){
//           obj.checkingUniqueness = 'not-unique';
//           return { emailExists: true};
//         }
//         obj.checkingUniqueness = 'unique'
//         return null
//       }),
//       catchError(err =>  {
//         console.log(err);
//         obj.checkingUniqueness = 'not-unique';
//         return of({emailExists: true})
//       }))

// }

const validatePhoneIsUnique = (
  apiservice: ChatService,
  regex: RegExp,
  obj: ParentsInformationComponent
): AsyncValidatorFn => (
  control: AbstractControl
):
  | Promise<{ phoneExists: boolean }>
  | Observable<{ phoneExists: boolean }>
  | null => {
  obj.checkingUniqueness = "checking";
  if (!control && control.value.length < 11 && !regex.test(control.value)) {
    obj.checkingUniqueness = "done";
    return of(null);
  }
  return apiservice
    .checkPhoneUniqueness({
      phone: control.value,
      [obj.editMode ? "edit" : ""]: obj.editMode ? true : "",
      [obj.editMode ? "guardian" : ""]: obj.editMode ? obj.parent.guardian : ""
    })
    .pipe(
      map(val => {
        if (val.message.includes("The phone has already been taken")) {
          obj.checkingUniqueness = "not-unique";
          return { phoneExists: true };
        }
        obj.checkingUniqueness = "unique";
        return null;
      }),
      catchError(err => {
        obj.checkingUniqueness = "not-unique";
        return of({ phoneExists: true });
      })
    );
};

@Component({
  selector: "app-parents-information",
  templateUrl: "./parents-information.component.html",
  styleUrls: ["./parents-information.component.css"]
})
export class ParentsInformationComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Output("previousPage") previousPage = new EventEmitter<string>();
  @Input("previous") previous: any;
  view:
    | ""
    | "state"
    | "address"
    | "lga"
    | "profile-form"
    | "work-form"
    | "picture"
    | "phone"
    | "email"
    | "verification"
    | "confirm-email"
    | "enter-code"
    | "done"
    | "choose-verification" = "";
  spinner: boolean = false;
  pageViews: string[] = [
    "",
    "profile-form",
    "phone",
    "email",
    "address",
    "state",
    "lga",
    "picture"
  ];
  selected: "email" | "phone" | "" = "";
  type: "1" | "2" | "" = "";
  parent: Partial<Parent>;
  stateLgas: LGA[] = [];
  NigerianStates: State[] = [];
  phoneForm: FormGroup;
  phoneVerificationForm: FormGroup;
  emailIsNotUnique: boolean = false;
  emailForm: FormGroup;
  address: string = "";
  state: string = "25";
  localGovtArea: string = "25";
  destroy: Subscription[] = [];
  lgaData: any = {};
  checkingUniqueness: "checking" | "not-unique" | "unique" | "done" | "" =
    "done";
  editMode: boolean = false;
  constructor(
    public generalservice: GeneralService,
    private store: Store<fromStore.AllState>,
    private fb: FormBuilder,
    private httpclient: HttpClient,
    private chatapi: ChatService
  ) {
    this.NigerianStates = sandBoxData().data.states;
    this.lgaData = { ...LgaData() };

    

    this.selectLgaInState(this.localGovtArea);
    this.manageGoingBackAndForth = this.manageGoingBackAndForth.bind(this);
  }

  ngOnChanges() {
    this.destroy[0] = this.store
      .select(fromStore.getParentState)
      .pipe(pluck("editMode"))
      .subscribe(val => {
        if (!val) return;
        this.editMode = true;
      });
  }

  ngAfterViewInit() {
    document
      .getElementById("backspace")
      .addEventListener("click", this.manageGoingBackAndForth);
  }

  ngOnInit(): void {
    this.destroy[1] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        //  console.log(val);
        this.parent = val as Parent;
      });

    this.phoneForm = this.fb.group({
      phone: [
        this.parent && this.parent.phone && this.editMode
          ? this.parent.phone
          : "",
        [Validators.required, Validators.pattern(/[0-9]|\./)],
        [validatePhoneIsUnique(this.chatapi, /\d{11}/gi, this)]
      ]
    });

    this.emailForm = this.fb.group({
      email: [
        this.parent && this.parent.email && this.editMode
          ? this.parent.email
          : "",
        [
          Validators.required,
          Validators.pattern(this.generalservice.emailRegex)
        ]
      ]
    });

    this.destroy[2] = this.generalservice.reset$.subscribe((val: string) => {
      if (val.length < 1) return;
      this.emailForm.reset();
      this.address = "";
      this.phoneForm.reset();
      this.checkingUniqueness = "done";
      this.state = "25";
      this.localGovtArea = "25";
      this.view = "";
      this.editMode = false;
      this.previousPage.emit("firstPage");
      sessionStorage.removeItem("school_avatar");
      this.selectLgaInState(this.localGovtArea);
    });

    setTimeout(() => {
      if (this.editMode) {
        this.state = this.parent.state || "25";
        this.address = this.parent.address;
        this.selectLgaInState(this.state);
        this.localGovtArea = this.parent.lga;
      }
    }, 500);
  }

  

  get phone(): AbstractControl {
    return this.phoneForm.get("phone");
  }

  get emailField(): AbstractControl {
    return this.emailForm.get("email");
  }

  get phoneField(): AbstractControl {
    return this.phoneForm.get("phone");
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
      this.type = "";
    } else {
      this.view = this.previous;
    }
  }

  selectLgaInState(value: string) {
    if (!value || value.length < 1) return;
    const selectedLga = this.lgaData[value || this.localGovtArea];
    this.stateLgas = selectedLga.data;
    // console.log(selectedLga);
    this.localGovtArea = selectedLga.data[0].id;
  }

  submitPhoneForm(form: FormGroup) {
    this.spinner = true;
    let parentDetails: Partial<Parent> = form.value;
    this.store.dispatch(new generalActions.addParents(parentDetails));
    this.view = "email";
    this.spinner = false;
    this.previousPage.emit("phone");
    this.checkingUniqueness = "done";
  }

  changeThisToProfile(event: Event) {
    const pa =
      event.target instanceof HTMLImageElement
        ? event.target.nextElementSibling
        : event.target instanceof HTMLParagraphElement
        ? event.target
        : (event.target as HTMLDivElement).querySelector(".bolded");
    switch (pa.textContent.toLowerCase()) {
      case "parent":
        this.type = "1";
        this.parent = {}; // / this is nececssary else it would throw an undefined error
        this.parent.type = this.type;
        this.store.dispatch(new generalActions.addParents(this.parent));
        break;
      case "guardian":
        this.type = "2";
        this.parent = {}; // this is nececssary else it would throw an undefined error
        this.parent.type = this.type;
        this.store.dispatch(new generalActions.addParents(this.parent));
        break;
    }
    this.view = "profile-form";
    this.previousPage.emit("");
  }

  changeToPhone(event) {
    this.view = event;
    this.previousPage.emit("profile-form");
  }

  changeToAnotherView() {
    let something;
    if (this.selected == "") {
      this.view = "verification";
      something = "phone";
    }
    if (this.selected == "phone") {
      this.view = "email";
      something = "email";
    }
    if (this.selected == "email") {
      this.view = "picture";
      something = "";
    }

    this.selected = something;
  }

  async submitEmail(form: FormGroup, event) {
    let guardian;
    const button = event.target as HTMLButtonElement;
    button.innerText = "";
    button.classList.add("spin");
    this.chatapi
      .checkEmailUniqueness({
        email: form.value.email,
        [this.editMode ? "edit" : ""]: this.editMode ? true : "",
        [this.editMode ? "guardian" : ""]: this.editMode
          ? this.parent.guardian
          : ""
      })
      .subscribe(
        val => {
          this.emailIsNotUnique = false;
          this.checkingUniqueness = "unique";
          button.classList.remove("spin");
          button.innerText = "Continue";
          // since checking for uniqueness is done, then continue.
          setTimeout(() => {
            const disconnect: Subscription = this.store
              .pipe(pluck("manageParent", "parent_info", "guardian"))
              .subscribe(val => (guardian = val));
            const refreshedState: Partial<Parent> = { email: form.value.email };
            this.store.dispatch(new generalActions.addParents(refreshedState));
            this.view = "address";
            this.previousPage.emit("email");
            this.spinner = false;
            this.checkingUniqueness = "done";
            disconnect.unsubscribe();
          }, 100);
        },
        err => {
          if (!this.editMode) {
            this.checkingUniqueness = "not-unique";
            this.emailIsNotUnique = true;
            button.classList.remove("spin");
            button.innerText = "Continue";
          } else {
            this.checkingUniqueness = "unique";
            this.emailIsNotUnique = false;
            button.classList.remove("spin");
            button.innerText = "Continue";
            this.view = "address";
            this.previousPage.emit("email");
            this.spinner = false;
            this.checkingUniqueness = "done";
          }
        }
      );
    // // this.spinner = true;
  }

  async change() {
    this.spinner = true;
    let parentInfo: Parent;
    const disconnect: Subscription = this.store
      .pipe(pluck("manageParent", "parent_info"))
      .subscribe((val: Parent) => {
        parentInfo = val;
      });
    this.previousPage.emit("lga");

    const {
      full_name,
      type,
      date_of_birth,
      email,
      phone,
      lga,
      picture,
      gender,
      address,
      state
    } = parentInfo;
    // debugger;
    if (!this.editMode) {
      this.chatapi
        .registerParent({
          full_name,
          type,
          email,
          date_of_birth,
          phone,
          gender,
          lga,
          address,
          state,
          school_id: this.parent.school_id || 1
        })
        .subscribe(
          async val => {
            // console.log((picture as File).size)
            await this.chatapi.uploadParentPicture({
              picture: picture as File,
              guardian: val.guardian
            });
            const refreshedState: Partial<Parent> = { guardian: val.guardian };
            this.store.dispatch(new generalActions.addParents(refreshedState));
            sessionStorage.setItem("guardian", val.guardian);
            const responseFromParent = new replyGiversOrReceivers(
              `I have provided my details`,
              "right"
            );
            this.generalservice.nextChatbotReplyToGiver = undefined;
            this.generalservice.responseDisplayNotifier(responseFromParent);
            this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
              "allow"
            );
            this.spinner = false;
            this.previousPage.emit("firstPage");
            // this is removed so that there wont be errors!!
            sessionStorage.removeItem("parentPicture");
            setTimeout(() => {
              this.generalservice.handleFlowController("");
              this.spinner = false;
              // this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
              //   // `Please ${parentInfo.full_name}, take a few seconds to verify the information you provided`,
              //   // "left",
              //   // `Ok let's verify it now, No later`,
              //   // `verifynow,verifylater`,
              //   // "prevent"
              // );
              sessionStorage.setItem("parent_name", `${parentInfo.full_name}`);
              this.spinner = false;
              disconnect.unsubscribe();
              const chatbotResponse = new replyGiversOrReceivers(
                `Thank you for registering, ${parentInfo.full_name ||
                  "John Bosco"}, would you like to edit the information you provided?`,
                "left",
                "Yes, No continue",
                "editparentinfo,verifylater",
                "prevent"
              );
              this.generalservice.responseDisplayNotifier(chatbotResponse);
              this.store.dispatch(new generalActions.editParentInfo(false));
              this.editMode = false;
            }, 600);
          },
          (err: HttpErrorResponse) => {
            // console.log(err);
            const { message } = err.error;
            this.spinner = false;
            this.generalservice.errorNotification(message);
          }
        );
    } else {
      // console.log('i am here');
      let form = new FormData();
      for (let elem in parentInfo) {
        form.append(elem, parentInfo[elem]);
      }
      try {
        const res = await this.chatapi.editGuardianDetails(
          form,
          this.parent.guardian
        );
        this.spinner = false;
        // const refreshedState: Partial<Parent> = { guardian: res.guardian };
        // this.store.dispatch(new generalActions.addParents(refreshedState));
        // sessionStorage.setItem('guardian', val.guardian);
        const responseFromParent = new replyGiversOrReceivers(
          `I have edited my details`,
          "right"
        );
        sessionStorage.removeItem('parentPicture');
        this.generalservice.nextChatbotReplyToGiver = undefined;
        this.generalservice.responseDisplayNotifier(responseFromParent);
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
        setTimeout(() => {
          this.generalservice.handleFlowController("");
          this.spinner = false;
          this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
            `Please ${parentInfo.full_name}, take a few seconds to verify the information you provided`,
            "left",
            `Ok let's verify it now, No later`,
            `verifynow,verifylater`,
            "prevent"
          );
          this.spinner = false;
          disconnect.unsubscribe();
          const chatbotResponse = new replyGiversOrReceivers(
            `Thank you , ${parentInfo.full_name || "John Bosco"}`,
            "left"
          );
          this.generalservice.responseDisplayNotifier(chatbotResponse);
          this.store.dispatch(new generalActions.editParentInfo(false));
          this.editMode = false;
        }, 300);
      } catch (error) {
        this.generalservice.errorNotification(
          "Sorry, an error occured. Please try again"
        );
        this.spinner = false;
      }
    }
  }

  submitAddressForm() {
    const refreshedState: Partial<Parent> = {
      address: this.address,
      state: this.state,
      lga: this.localGovtArea
    };
    this.store.dispatch(new generalActions.addParents(refreshedState));
    this.view = "picture";
    this.previousPage.emit("email");
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
    document
      .getElementById("backspace")
      .removeEventListener("click", this.manageGoingBackAndForth);
    this.store.dispatch(new generalActions.editParentInfo(false));
    this.editMode = false;
  }
}
