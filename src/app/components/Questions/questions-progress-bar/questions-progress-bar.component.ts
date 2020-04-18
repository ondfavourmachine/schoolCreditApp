import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef
} from "@angular/core";
import { PercentageOfQuestion } from "src/app/models/Questionaire";

@Component({
  selector: "app-questions-progress-bar",
  templateUrl: "./questions-progress-bar.component.html",
  styleUrls: ["./questions-progress-bar.component.css"]
})
export class QuestionsProgressBarComponent
  implements OnInit, OnChanges, AfterViewInit {
  @Input("questionProgressBarFromCtrl")
  questionProgressBarFromCtrl: PercentageOfQuestion;
  divElement: HTMLDivElement;
  width: string;
  @ViewChild("innerDiv") innerDiv: ElementRef;
  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.divElement = this.innerDiv.nativeElement;
    const outerDivElement = document.getElementById('progress');
    outerDivElement.setAttribute('data-percent', this.width);
    this.divElement.style.width = `${this.width}%`;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.width = changes.questionProgressBarFromCtrl.currentValue;
    this.changeWidthOfProgressBar(this.width);
  }

  changeWidthOfProgressBar(width: string) {
    if (!this.divElement) {
      return;
    }
    const outerDivElement = document.getElementById('progress');
    outerDivElement.setAttribute('data-percent', width);
    this.divElement.style.width = `${width}%`;
  }
}
