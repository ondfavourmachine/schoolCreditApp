import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { GeneralService } from "../../../services/generalService/general.service";

@Component({
  selector: "app-identify-or-anonymous",
  templateUrl: "./identify-or-anonymous.component.html",
  styleUrls: ["./identify-or-anonymous.component.css"]
})
export class IdentifyOrAnonymousComponent implements OnInit {
  public iAForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private generalservice: GeneralService
  ) {}

  ngOnInit(): void {
    this.iAForm = this.fb.group({
      name: ["", Validators.required],
      age: ["", Validators.required],
      gender: [""],
      tAndC: ["", Validators.required]
    });
  }

  submit(form: FormGroup) {
    this.generalservice.responseDisplayNotifier({
      message: "",
      text: "I have provided my details",
      nextStage: "moneyOrItems",
      reply: {
        message: "What Would you like to give. Money or Food items",
        direction: "left",
        button: "money,items",
        extraInfo: "money,items"
      }
    });
  }
}
