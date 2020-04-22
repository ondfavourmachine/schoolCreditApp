import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  OnChanges,
  AfterContentChecked
} from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { GeneralService } from "./services/generalService/general.service";
import { Subscription } from "rxjs";
import { Alert } from "./models/Alert";

interface observableAggregator {
  flowControl?: Subscription;
  intermediateResponse?: Subscription;
}
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent
  implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  // public flowControlHolder: string = 'welcomeModal';
  public showModal: string = "none";
  public modalHolder: HTMLDivElement;
  public toKYCComponent: any;
  private btnTrigger: HTMLButtonElement;
  private observableAggregator: observableAggregator = {};
  public globalOverlay: string = "none";
  errorHouse: { error: Alert } = { error: new Alert(false, "") };
  constructor(
    private router: Router,
    public generalservice: GeneralService,
    private cd: ChangeDetectorRef
  ) {
    router.events.subscribe(val => {
      if (val instanceof NavigationStart) {
        const { url } = val;
        generalservice.receiver = url.substring(1, url.length);
        // this.welcomeMsgCtrl(url);
      }
    });
  }

  ngOnInit() {
    this.generalservice.controlGlobalNotifier$.subscribe(val => {
      if (val == "on") {
        this.globalOverlay = "flex";
      } else {
        this.globalOverlay = "none";
      }
    });

    this.observableAggregator.flowControl = this.generalservice.flowCtrl$.subscribe(
      val => {
        console.log(val);
        this.generalservice.flowControlHolder = String(val);
        this.clickAButton();
      }
    );

    this.observableAggregator.intermediateResponse = this.generalservice.intermediateResponse$.subscribe(
      val => {
        if (!val || !val["message"]) {
          // console.log(val);
          return;
        }

        // closeBtn.click();
      }
    );
  }
  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.modalHolder = document.getElementById("myModal") as HTMLDivElement;
    this.btnTrigger = document.getElementById(
      "btnTrigger"
    ) as HTMLButtonElement;
  }

  // programmatically click the modal close button
  clickAButton() {
    this.btnTrigger.click();
  }

  // this function will choose to grey out buttons added dynamically or not to
  preventHidingOfbuttons(explicitInstruction?: string) {
    // sessionStorage.removeItem("anonymous");
    this.generalservice.flowControlHolder = "";
    try {
      // try to get the timer if it is in the dom
      const html = document.querySelector(".timer").querySelector("span");
      if (html.innerHTML) {
        try {
          let strong = html.querySelector("strong").textContent;
          if (strong.toString() == "0") {
            this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
              "allow"
            );
            this.switchOfModal();
            return;
          }
        } catch (e) {
          this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
            "allow"
          );
          this.switchOfModal();
          return;
        }

        this.errorHouse.error = new Alert(
          true,
          "You cannot leave now. Try to complete the test."
        );
        this.generalservice.removeErrorAlert(this.errorHouse, 6000);
      } else {
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
          "prevent"
        );
      }
    } catch (e) {
      // console.log(explicitInstruction);
      if (
        explicitInstruction == "Upload Drivers License" ||
        "Terms And Condition" ||
        "BVN and Date Of Birth" ||
        "Bio and Next Of Kin" ||
        "Residential Address" ||
        "Work and Income Information" ||
        "Upload Photo and bank statement"
      ) {
        this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
          "prevent"
        );
        this.switchOfModal();
        return;
      }

      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      this.switchOfModal();
    }
    // let dontShow: string;
  }

  // launch the modal on button click
  lauchModal() {
    this.showModal = "block";
  }

  switchOfModal() {
    this.showModal = "none";
    // console.log(this.showModal);
  }

  // unsubscribe to prevent memory leaks
  ngOnDestroy() {
    this.observableAggregator.flowControl.unsubscribe();
    this.observableAggregator.intermediateResponse.unsubscribe();
  }
}
