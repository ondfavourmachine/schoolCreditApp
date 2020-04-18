import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-questions-text",
  templateUrl: "./questions-text.component.html",
  styleUrls: ["./questions-text.component.css"]
})
export class QuestionsTextComponent implements OnInit {
  @Input("questionTextFromCtrl") questionTextFromCtrl: string;
  constructor() {}

  ngOnInit() {}
}
