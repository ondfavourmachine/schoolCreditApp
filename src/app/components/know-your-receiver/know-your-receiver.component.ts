import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-know-your-receiver",
  templateUrl: "./know-your-receiver.component.html",
  styleUrls: ["./know-your-receiver.component.css"]
})
export class KnowYourReceiverComponent implements OnInit {
  public toKYCComponent: { nextStage?: string; previousStage?: string } = {};
  public familyGroupForm: FormGroup;
  public loading: boolean = true; // this is for the hidden attribute, when true = hide, when false = unhide
  public selectedParent: string = undefined;
  constructor(
    private generalservice: GeneralService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.generalservice.commKYC$.subscribe(val => {
      // console.log(val);
      this.toKYCComponent = val;
    });

    this.familyGroupForm = this.fb.group({
      fullname: ["", Validators.required],
      phonenumber: ["", Validators.required],
      occupation: ["", Validators.required]
    });
  }

  submit(form) {
    this.loading = false;
    // console.log(form);

    setTimeout(() => {
      this.loading = true;
      let previousStage = this.toKYCComponent.nextStage;
      this.toKYCComponent = { nextStage: "familyDetails", previousStage };
    }, 1500);
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

  public occupationIsRequired() {
    return this.occupation.hasError("required") && this.occupation.touched;
  }

  public phoneIsRequired() {
    return this.phonenumber.hasError("required") && this.phonenumber.touched;
  }

  public fullnameIsRequired() {
    return this.fullname.hasError("required") && this.fullname.touched;
  }

  selectFamilySize(event) {
    try {
      const div = (event.srcElement as HTMLElement).closest(".numberBlockOne");
      // console.log(div);
      div.classList.add("thickenBorderBottom");
      setTimeout(
        () => this.controlDisplayOfNumberBlockAndNumberBlockAlt(),
        700
      );
    } catch (e) {
      const div = (event.srcElement as HTMLElement).closest(".numberBlockAlt");
      div.classList.add("thickenBorderBottom");
      setTimeout(
        () => this.controlDisplayOfNumberBlockAndNumberBlockAlt("animationIn"),
        1000
      );
    }
  }

  controlDisplayOfNumberBlockAndNumberBlockAlt(animation?: string) {
    if (animation) {
      const translateDiv = document.querySelector(
        ".translateCoverPlate"
      ) as HTMLDivElement;
      translateDiv.classList.add(animation);
      translateDiv.style.display = "block";
      return;
    }
    (document.querySelector(".numberBlock") as HTMLDivElement).style.display =
      "none";
    (document.querySelector(
      ".numberBlockAlt"
    ) as HTMLDivElement).style.display = "grid";
    (document.querySelector(
      ".modifiableParagraph"
    ) as HTMLDivElement).textContent = `Which family
    member are you?`;
  }
}
