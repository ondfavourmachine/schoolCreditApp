import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-giver-component",
  templateUrl: "./giver-component.component.html",
  styleUrls: ["./giver-component.component.css"]
})
export class GiverComponentComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    sessionStorage.removeItem("userLatLng");
  }
}
