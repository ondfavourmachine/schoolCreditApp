import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-question-options",
  templateUrl: "./question-options.component.html",
  styleUrls: ["./question-options.component.css"]
})
export class QuestionOptionsComponent implements OnInit {
  @Input("questionOptionsFromCtrl") questionOptionsFromCtrl: Array<{
    option: string;
    value: any;
  }>;
  @Output("broadCastAnswerChosen") broadCastAnswerChosen = new EventEmitter<
    any
  >();
  constructor() {}

  ngOnInit() {}

  sendOptions(option, event) {
    // console.log(option);
    const div = event.srcElement.closest(".item") as HTMLDivElement;
    div.style.border = "2px solid rgba(0, 0, 255, 0.64)";
    // console.log(option);
    this.broadCastAnswerChosen.emit(option);
  }
}
