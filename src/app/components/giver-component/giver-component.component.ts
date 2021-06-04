import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GeneralService } from "src/app/services/generalService/general.service";
import { Store } from "@ngrx/store";
import * as generalActions from "../../store/actions/general.action";

@Component({
  selector: "app-giver-component",
  templateUrl: "./giver-component.component.html",
  styleUrls: ["./giver-component.component.css"]
})

export class GiverComponentComponent implements OnInit {
  name: string;
  constructor(
    
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store
    ) {

  }

  ngOnInit(): void {
    sessionStorage.removeItem("userLatLng");
    // this.router.url.split('/').length > 2 ?  this.router.url.split('/').slice(-1)[0] : undefined;
    const userNameOfSchool = this.activatedRoute.snapshot.paramMap.get('name');
    this.handleContinuingRequest(userNameOfSchool);
    this.name = userNameOfSchool;
  }


  handleContinuingRequest(schoolString: string): void{
    let resultOfQueryParamsCheck: any;
    if(schoolString.includes('?')){
      // const continuingrequest = schoolString.split('?')[0];
      const obs = this.activatedRoute.queryParamMap.subscribe((val) => {
        if(val.get('continuingrequest') == '1'){
          this.store.dispatch(
              new generalActions.returningParentHasBeenApproved({
                continuingrequest: val.get('continuingrequest'),
                nameOfParent: val.get('name')
              })
            )
        }
        resultOfQueryParamsCheck = val.get('continuingrequest');
      })
      //  console.log({continuingrequest, schoolString});
      if(resultOfQueryParamsCheck){
        this.checkWhetherButtonIsAvailableAndReturnIt()
        .then((val ) => {
          const button = val[0] as HTMLButtonElement;
          button.click();
          obs.unsubscribe();
        })
        .catch(err => console.log(err))
      }
     
    }else{
      return;
    }
    
  }

  async checkWhetherButtonIsAvailableAndReturnIt(): Promise<NodeListOf<Element>>{
    return new Promise((resolve, reject)=> {
      const elementFound = document.querySelectorAll('[data-button=" continue an existing request-continuingRequest"]');
      if(elementFound.length > 0) resolve(elementFound);

    
        new MutationObserver((mutations, observer) => {
          const elementFound = document.querySelectorAll('[data-button=" continue an existing request-continuingRequest"]');
          if(elementFound.length > 0) {
            resolve(elementFound);
  
            observer.disconnect();
          }
  
  
        }).observe(document.documentElement, {
          childList: true,
          subtree: true
        })
    })
  }
}
