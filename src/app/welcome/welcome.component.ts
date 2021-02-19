import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-welcome",
  templateUrl: "./welcome.component.html",
  styleUrls: ["./welcome.component.css"]
})
export class WelcomeComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  gotoReceiver() {
    this.router.navigate(["receiver"]);
    (document.querySelector(".modal-close") as HTMLSpanElement).click();
  }

  gotoGiver() {
    this.router.navigate(["school"]);
    (document.querySelector(".modal-close") as HTMLSpanElement).click();
  }
}
