import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-parents-information",
  templateUrl: "./parents-information.component.html",
  styleUrls: ["./parents-information.component.css"]
})
export class ParentsInformationComponent implements OnInit {
  view: "" | "profile-form" | "work-form" | "picture" | "email" = "";
  constructor() {}

  ngOnInit(): void {}

  addPicture() {
    document.getElementById("picture-upload").click();
  }
}
