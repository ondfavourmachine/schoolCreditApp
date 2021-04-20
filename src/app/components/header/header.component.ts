import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";

import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import { SchoolDetailsModel } from "src/app/models/data-models";
import { pluck } from "rxjs/operators";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  destroyAnything: Subscription[] = [];
  schoolDetails: Partial<SchoolDetailsModel> = {}
  isQuestions: boolean = false;
  constructor(
    private gs: GeneralService,
    private store: Store,
    private router: Router
  ) { 
    
  }

  ngOnInit() {
    this.destroyAnything[1]= this.store.select(fromStore.getSchoolDetailsState) 
    .pipe(pluck('school_Info'))
    .subscribe((val) => this.schoolDetails = val) 
   }

  launchMenu() {
    this.gs.handleFlowController("welcomeModal");
  }

  routeToQuestions(typeOfState: string){
    sessionStorage.clear();
    this.router.navigate(['user', 'questions'], {queryParams: {comp: typeOfState}})
    this.isQuestions = true;
  }
  // change(event) {}
}
 