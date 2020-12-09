import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-bank-partnership",
  templateUrl: "./bank-partnership.component.html",
  styleUrls: ["./bank-partnership.component.css"]
})
export class BankPartnershipComponent implements OnInit {
  page: "" | "bvn" | "valid-id" | "bank-details" | "checking" | "enter-id" | 'result' = "";
  selected: string;
  constructor() {}

  ngOnInit(): void {}

  selectThis(event) {
    const p =
      event.target instanceof HTMLImageElement
        ? event.target.nextElementSibling
        : (event.target as HTMLElement).querySelector(".bolded");

    // debugger;
    this.selected = p.textContent.trim();
  }
}
