import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";

import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import { SchoolDetailsModel } from "src/app/models/data-models";
import { pluck } from "rxjs/operators";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  destroyAnything: Subscription[] = [];
  schoolDetails: Partial<SchoolDetailsModel> = {}
  constructor(
    private gs: GeneralService,
    private store: Store
  ) { }

  ngOnInit() {
    this.destroyAnything[1]= this.store.select(fromStore.getSchoolDetailsState) 
    .pipe(pluck('school_Info'))
    .subscribe((val) => this.schoolDetails = val)
   }

  launchMenu() {
    this.gs.handleFlowController("welcomeModal");
  }

  // change(event) {}
}
