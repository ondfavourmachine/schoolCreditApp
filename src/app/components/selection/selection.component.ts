import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-selection",
  templateUrl: "./selection.component.html",
  styleUrls: ["./selection.component.css"]
})
export class SelectionComponent implements OnInit {
  selectedIndex: number = 0;
  currentFamilyToShow: any;
  familiesToPay: any[] = [];
  arrayOfSelectedFamilies: any[] = [];
  testing = [
    "../../../assets/images/woman-5146765_640.jpg",
    "../../../assets/images/african-family.jpg",
    "../../../assets/images/family-photos.jpg"
  ];
  constructor(
    public generalservice: GeneralService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentFamilyToShow = this.generalservice.familiesForSelection[
      this.selectedIndex
    ];
    this.generalservice.controlGlobalNotificationSubject.next("off");
  }

  next() {
    this.selectedIndex++;
    this.currentFamilyToShow = this.generalservice.familiesForSelection[
      this.selectedIndex
    ];
  }

  prev() {
    this.selectedIndex--;
    this.currentFamilyToShow = this.generalservice.familiesForSelection[
      this.selectedIndex
    ];
  }

  selectAFamilyForPayment(id) {
    let temp = this.generalservice.familiesForSelection.find(
      family => family.id == id
    );
    this.familiesToPay.push(temp);
    // console.log(this.familiesToPay);
    let index = this.generalservice.familiesForSelection.findIndex(
      family => family.id == id
    );
    this.next();
    this.generalservice.familiesForSelection.splice(index, 1);
    // console.log(this.generalservice.familiesForSelection);
  }

  paySelectedFamilies() {
    this.generalservice.familiesForSelection = [];
    const giver_id = sessionStorage.getItem("giver");
    const selected_receivers = [...this.familiesToPay];
    this.http
      .post(`${this.generalservice.apiUrl}selectedreceivers`, {
        giver_id,
        selected_receivers
      })
      .subscribe();
    this.generalservice.controlGlobalNotificationSubject.next("on");
    this.generalservice.familiesForCashDonation = [...this.familiesToPay];
    this.generalservice.handleFlowController("foundBeneficiary");
  }
}
