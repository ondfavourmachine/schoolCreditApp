import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-edit-parent-info",
  templateUrl: "./edit-parent-info.component.html",
  styleUrls: ["./edit-parent-info.component.css"]
})
export class EditParentInfoComponent implements OnInit {
  page: "" | "work-form" | "profile-form" | "picture" = "";
  constructor() {}

  ngOnInit(): void {}
}
