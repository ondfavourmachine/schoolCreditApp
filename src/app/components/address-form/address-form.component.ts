import { Component, OnInit, EventEmitter, Output, OnDestroy } from "@angular/core";
import { sandBoxData } from "src/app/models/sandboxData";
import { LgaData } from "src/app/models/lgaData";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { Store } from "@ngrx/store";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { Parent } from "src/app/models/data-models";

interface State {
  id: string;
  value: string;
}

interface LGA extends State {}
@Component({
  selector: "app-address-form",
  templateUrl: "./address-form.component.html",
  styleUrls: ["./address-form.component.css"]
})
export class AddressFormComponent implements OnInit, OnDestroy {
  @Output() changeUpTheViewThree = new EventEmitter<string>();
  @Output() doneAddingAddress = new EventEmitter<string>();
  NigerianStates: State[] = [];
  fetchingSummary: boolean =false;
  stateLgas: LGA[] = [];
  lgaData: any = {};
  parentAddressInfoForm: FormGroup;
  destroy: Subscription[] = [];
  spinner: boolean = false;
  guardianID: any = undefined;
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private chatservice: ChatService
  ) {
    this.NigerianStates = sandBoxData().data.states;
    this.lgaData = { ...LgaData() };
  }

  ngOnInit(): void {
    this.parentAddressInfoForm = this.fb.group({
      address: ["", Validators.required],  
      state: ["", Validators.required],
      lga: ["", Validators.required],
      resident_years: ["", Validators.required]
    });

    this.destroy[0] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        // console.log(val);
        const { address, guardian } = val as Parent;
        this.guardianID = guardian;
        this.parentAddressInfoForm.get("address").patchValue(address);
      });

    // this.destroy[1] = this.store
    //   .select(fromStore.getParentState)
    //   .subscribe(val => {
    //     console.log(val);
    //   });
  }

  selectLgaInState(value: string) {
    const selectedLga = this.lgaData[value];
    this.stateLgas = selectedLga.data;
  }

  submitThisForm(form: FormGroup) {
    // changeUpTheViewThree.emit('bvn')
    this.fetchingSummary = true;
    // form.disable();
    this.doneAddingAddress.emit(form.value);
    // this.spinner = true;
    // let formToSubmit = { ...form.value };
    // formToSubmit.guardian = this.guardianID;
    // this.chatservice.saveParentAddressInformation(formToSubmit).subscribe(
    //   val => {
    //     const { state, bus_stop, city, address, lga, post_code } = val.data;
    //     let objToStore = { state, bus_stop, city, address, lga, post_code };
      
    //     this.spinner = false;
    //     this.changeUpTheViewThree.emit("bvn");
    //   },
    //   err => console.log(err)
    // );
  }

  ngOnDestroy(){
    this.destroy.forEach(element => element.unsubscribe())
  }
}
