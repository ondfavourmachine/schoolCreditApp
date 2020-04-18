import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { GeneralService } from "src/app/services/generalService/general.service";
import { Timer } from "src/app/models/timer";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  @Output("timeHasPassed") timeHasPassed = new EventEmitter<string>();
  headerDisplay: string;
  displayTimer: boolean = true;
  timerInstance: Timer;
  constructor(private generalservice: GeneralService) {}

  ngOnInit() {
    this.generalservice.url$.subscribe(val => {
      this.headerDisplay = val;
    });

    // controls the timer
    // this.generalservice.timer$.subscribe(
    //   val => {
    //     // console.log(val);
    //     let timekeeper = document.querySelector(
    //       ".timekeeper"
    //     ) as HTMLSpanElement;
    //     switch (val) {
    //       case "showTimer":
    //         timekeeper.textContent = "0 seconds";
    //         this.displayTimer = false;
    //         break;
    //       case "startTimer":
    //         this.timerInstance = new Timer(120, timekeeper);
    //         this.displayTimer = false;
    //         break;
    //       case "dontShow":
    //         (document.querySelector(
    //           ".timekeeper"
    //         ) as HTMLSpanElement).innerHTML = null;
    //         this.displayTimer = true;
    //         try {
    //           this.timerInstance.clearTimer();
    //         } catch (e) {
    //           this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
    //             "allow"
    //           );
    //           sessionStorage.clear();
    //         }
    //         delete this.timerInstance;
    //         break;
    //     }
    //   },
    //   err => console.log(err)
    // );
    // document.addEventListener("timeHasElapsed", e => {
    //   this.timeHasPassed.emit("timeHasPassed");
    // });
  }

  change(event) {}
}
