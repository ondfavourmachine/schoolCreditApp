import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-continuing-existing-requests",
  templateUrl: "./continuing-existing-requests.component.html",
  styleUrls: ["./continuing-existing-requests.component.css"]
})
export class ContinuingExistingRequestsComponent implements OnInit {
  view: "" | "four-digit-pin" = "";
  arrayOfNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  overlay: boolean = false;
  constructor() {}

  ngOnInit(): void {}

  checking() {
    this.overlay = true;

    document.querySelector(".checking").classList.add("working");
    setTimeout(() => {
      document.querySelector(".checking").classList.remove("working");
      this.overlay = false;
      this.view = "four-digit-pin";
    }, 2000);
  }
}
