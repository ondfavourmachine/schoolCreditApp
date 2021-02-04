import { Component, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Parent } from "src/app/models/data-models";
import { Subscription } from "rxjs";
import { pluck } from "rxjs/operators";


@Component({
  selector: "app-profile-form",
  templateUrl: "./profile-form.component.html",
  styleUrls: ["./profile-form.component.css"]
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  @Output() changeUpTheViewThree = new EventEmitter<string>();
  destroy: Subscription[] = [];
  parentInfo: Partial<Parent> = {}
  parentProfileForm: FormGroup;
  constructor(
    private store: Store<fromStore.AllState>,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.destroy[0] = this.store
      .select(fromStore.getParentState)
      .pipe(pluck('parent_info'))
      .subscribe(val => this.parentInfo = {...val as Parent});

    this.parentProfileForm = this.fb.group({
      full_name: [this.parentInfo && this.parentInfo.full_name ? this.parentInfo.full_name : '' , Validators.required],
      date_of_birth: [this.parentInfo && this.parentInfo.date_of_birth ? this.parentInfo.date_of_birth : '', Validators.required],
      gender: [this.parentInfo && this.parentInfo.gender ? this.parentInfo.gender : '', Validators.required]
    });
  }

  get dob() {
    return this.parentProfileForm.get("date_of_birth");
  }

  submitForm(form: FormGroup) {
    let parentDetails: Partial<Parent> = form.value;
    this.store.dispatch(new generalActions.addParents(parentDetails));
    this.changeUpTheViewThree.emit("phone");
  }

  ngOnDestroy(){

  }
}
