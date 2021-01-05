import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { Subscription } from "rxjs";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { Store } from "@ngrx/store";
import { Parent } from "src/app/models/data-models";

@Component({
  selector: "app-work-form",
  templateUrl: "./work-form.component.html",
  styleUrls: ["./work-form.component.css"]
})
export class WorkFormComponent implements OnInit, OnDestroy {
  @Output() changeUpTheViewTwo = new EventEmitter<string>();
  parentWorkInfoForm: FormGroup;
  spinner: boolean = false;
  destroy: Subscription[] = [];
  guardianID: any = undefined;
  constructor(
    private fb: FormBuilder,
    private chatservice: ChatService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.parentWorkInfoForm = this.fb.group({
      employer: ["", Validators.required],
      role: ["", Validators.required],
      annual_salary: ["", Validators.required]
    });

    this.destroy[0] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        // console.log(val);
        const { guardian } = val as Parent;
        this.guardianID = guardian;
      });
   
  }

  submitThisForm(form: FormGroup) {
    // )
    this.spinner = true;
    let formToSubmit = { ...form.value };
    formToSubmit.guardian = this.guardianID;
    this.chatservice.saveParentWorkInformation(formToSubmit).subscribe(
      val => {
        // console.log(val);
        const { employer, role, annual_salary } = val.data;
        let objToStore = { employer, role, annual_salary };
        this.store.dispatch(
          new generalActions.updateParentWorkInformation(objToStore)
        );
        this.spinner = false;
        this.changeUpTheViewTwo.emit("address-info");
      },
      err => console.log(err)
    );
  }

  ngOnDestroy() {
    this.destroy.forEach(element => element.unsubscribe());
  }
}
