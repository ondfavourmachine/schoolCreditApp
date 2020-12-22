import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Parent } from "src/app/models/data-models";
import { pluck } from "rxjs/operators";

@Component({
  selector: "app-profile-form",
  templateUrl: "./profile-form.component.html",
  styleUrls: ["./profile-form.component.css"]
})
export class ProfileFormComponent implements OnInit {
  @Output() changeUpTheViewThree = new EventEmitter<string>();

  parentProfileForm: FormGroup;
  constructor(
    private store: Store<fromStore.AllState>,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // this.store
    //   .pipe(pluck("manageParent", "parent_info"))
    //   .subscribe(val => console.log(val));

    this.parentProfileForm = this.fb.group({
      full_name: ["", Validators.required],
      age: ["", Validators.required],
      gender: ["", Validators.required],
      address: ["", Validators.required]
    });
  }

  get age() {
    return this.parentProfileForm.get("age");
  }

  submitForm(form: FormGroup) {
    let parentDetails: Partial<Parent> = form.value;
    this.store.dispatch(new generalActions.addParents(parentDetails));
    this.changeUpTheViewThree.emit("phone");
  }
}
