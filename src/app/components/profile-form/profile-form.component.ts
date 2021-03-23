import { Component, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Parent } from "src/app/models/data-models";
import { Subscription } from "rxjs";
import { pluck } from "rxjs/operators";

import { GeneralService } from "src/app/services/generalService/general.service";


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
  myAge: number;
  parentIsTooYoung: boolean = false;
  constructor(
    private store: Store<fromStore.AllState>,
    private fb: FormBuilder,
    private generalservice: GeneralService
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

    this.destroy[1] = this.generalservice.reset$.subscribe(
      (val: string) => {
        if (val.length < 1) return;
        this.store.dispatch(new generalActions.addParents({full_name: '', date_of_birth: '', gender: ''}));
        this.parentProfileForm.reset();
        this.parentInfo = undefined;
      }
    )
  }

  get dob() {
    return this.parentProfileForm.get("date_of_birth");
  }

  submitForm(form: FormGroup) {
    if(this.myAge > 18){
      this.parentIsTooYoung = false;
      let parentDetails: Partial<Parent> = form.value;
      this.store.dispatch(new generalActions.addParents(parentDetails));
      this.changeUpTheViewThree.emit("phone");
    }else{
      this.parentIsTooYoung = true;
    }
  }

  runDateAnalysis(value: string){
   let startDate  = value;
    if (startDate.length != 10 || startDate.indexOf("-") < 0) {
        // console.log('Check date format');
        return null;
    }
    // get Age
    let nowDate = new Date();
    let birth = new Date(startDate);

    let now = nowDate.getFullYear();
    let mine = birth.getFullYear();
    this.myAge = now - mine -1;   
}

  ngOnDestroy(){

  }
}
