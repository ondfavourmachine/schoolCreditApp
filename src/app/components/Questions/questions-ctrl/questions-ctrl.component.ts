import {
  Component,
  OnInit,
  OnDestroy,
  ComponentFactoryResolver,
  Output,
  EventEmitter
} from "@angular/core";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { checkDOBResponse } from "src/app/models/message";
import {
  QuestionsToAsk,
  Questionaire,
  PercentageOfQuestion,
  DisplayQuestion
} from "src/app/models/Questionaire";
import { GeneralService } from "src/app/services/generalService/general.service";
import { Subscription, BehaviorSubject } from "rxjs";
import { Alert } from "src/app/models/Alert";
import { HttpErrorResponse } from "@angular/common/http";
import { Timer } from "src/app/models/timer";

// credibleswidget.creditclan.com
@Component({
  selector: "app-questions-ctrl",
  templateUrl: "./questions-ctrl.component.html",
  styleUrls: ["./questions-ctrl.component.css"]
})
export class QuestionsCtrlComponent implements OnInit, OnDestroy {
  // from header component
  @Output("timeHasPassed") timeHasPassed = new EventEmitter<string>();
  headerDisplay: string;
  displayTimer: boolean = true;
  timerInstance: Timer;
  // ends here
  questionsText: string;
  questionsOptions: Array<{ option: string; value: string }>;
  questionsProgress: string;
  currentQuestion: DisplayQuestion;
  answer: { ref_no?: string; answer?: string } = {};
  destroytimeHasElapsed: Subscription;
  destroyQuestionCtrl: Subscription;
  destroyQuestionsHasArrived: Subscription;
  control: string = "entrance";
  errorHouse: { error: Alert } = { error: new Alert(false, "") };

  // temporary solution
  private questionsHaveArrivedBehaviorSubject = new BehaviorSubject("");
  public questionsAreReadyObservable$ = this.questionsHaveArrivedBehaviorSubject.asObservable();

  counter: number = 0;
  constructor(
    private chatservice: ChatService,
    private generalservice: GeneralService
  ) {
    this.retrieveQuestionsFromStorageOrServer();
  }

  ngOnInit() {
    // this.retrieveQuestionsFromStorageOrServer();
    // this.destroytimeHasElapsed = this.generalservice.timeHasElapsed$.subscribe(
    //   val => {
    //     // console.log(val);
    //     if (val == "timeHasElapsed") {
    //       this.errorHouse.error = new Alert(true, "Oops! You ran out of time.");
    //       this.displayAnalysisPage();
    //       setTimeout(() => {
    //         this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
    //           "allow"
    //         );
    //         // this.generalservice.responseDisplayNotifier(
    //         //   "questionsHasBeenAnswered"
    //         // );
    //         sessionStorage.clear();
    //       }, 2500);
    //     }
    //   },
    //   err => console.log(err)
    // );
    this.destroyQuestionCtrl = this.generalservice.questionsCtrl$.subscribe(
      val => {
        this.displayAnalysisPage();
      }
    );

    this.destroyQuestionsHasArrived = this.questionsAreReadyObservable$.subscribe(
      val => {
        if (val == "questionsHaveArrived") {
          let btn = document.querySelector(".beginTest") as HTMLAnchorElement;
          this.removeIntroPageAndDisplayQuestion(btn);
        } else {
          return;
        }
      }
    );

    this.generalservice.timer$.subscribe(
      val => {
        // console.log(val);
        let timekeeper = document.querySelector(
          ".timekeeper"
        ) as HTMLSpanElement;
        switch (val) {
          case "showTimer":
            timekeeper.textContent = "0 seconds";
            this.displayTimer = false;
            break;
          case "startTimer":
            this.timerInstance = new Timer(120, timekeeper);
            this.displayTimer = false;
            break;
          case "dontShow":
            (document.querySelector(
              ".timekeeper"
            ) as HTMLSpanElement).innerHTML = null;
            this.displayTimer = true;
            try {
              this.timerInstance.clearTimer();
            } catch (e) {
              this.generalservice.ctrlDisableTheButtonsOfPreviousListElement(
                "allow"
              );
              sessionStorage.clear();
            }
            delete this.timerInstance;
            break;
        }
      },
      err => console.log(err)
    );
    document.addEventListener("timeHasElapsed", e => {
      this.notifyTheUserThatTimeForQuestionHasElapsed();
      // this.timeHasPassed.emit("timeHasPassed");
    });
  }

  retrieveQuestionsFromStorageOrServer() {
    try {
      // debugger;
      const questions: QuestionsToAsk[] = JSON.parse(
        sessionStorage.getItem("questions")
      );
      // console.log(questions);
      this.generalservice.allQuestions = [...questions];
      this.generalservice.totalLengthOfQuestions =
        this.generalservice.totalLengthOfQuestions == 0
          ? this.generalservice.allQuestions.length
          : this.generalservice.totalLengthOfQuestions;
      this.dispatchPartsOfQuestions();
    } catch (e) {
      this.fetchQuestionsFromServer();
    }
  }

  fetchQuestionsFromServer(btn?: HTMLAnchorElement) {
    let ref_no = sessionStorage.getItem("ref_no");
    this.chatservice.getCredibiltyQuestions(ref_no).subscribe(
      val => {
        this.generalservice.allQuestions = [...val.text];
        sessionStorage.setItem(
          "questions",
          JSON.stringify(this.generalservice.allQuestions)
        );
        this.generalservice.totalLengthOfQuestions =
          this.generalservice.totalLengthOfQuestions == 0
            ? this.generalservice.allQuestions.length
            : this.generalservice.totalLengthOfQuestions;
        this.dispatchPartsOfQuestions();
      },
      err => {
        if (err instanceof HttpErrorResponse && err.status == 500) {
          this.errorHouse.error = new Alert(
            true,
            "Oops! we couldnt fetch the questions at this time. Please try again later."
          );
          this.generalservice.removeErrorAlert(this.errorHouse);
          let btn = document.querySelector(".beginTest") as HTMLAnchorElement;
          this.generalservice.loading4button(btn, "done", "Begin Test");
          return;
        }

        this.errorHouse.error = new Alert(
          true,
          "Sorry, please close the modal, reload the page and try again."
        );
        this.generalservice.removeErrorAlert(this.errorHouse);
      }
    );
  }

  dispatchPartsOfQuestions() {
    let question: Array<DisplayQuestion>, percentage: PercentageOfQuestion;
    this.questionsOptions = [];
    question = this.generalservice.modifyQuestions();
    percentage = this.generalservice.calculatePercentage();
    // console.log(question, percentage);
    try {
      this.currentQuestion = question[0];
    } catch (e) {
      // debugger;
      this.chatservice.uploadAnswers(this.answer).subscribe();
      this.generalservice.controlQuestionsFlow("no more questions");
      setTimeout(() => {
        this.endOfQuestioning();
      }, 3000);
      return;
    }
    this.questionsText = question[0].question;
    this.questionsOptions = question[0].options;
    this.questionsProgress = Math.floor(
      percentage.current_perentage
    ).toString();
  }

  sendAnswerToApi(event) {
    this.answer.ref_no = sessionStorage.getItem("ref_no");
    this.answer.answer = `${this.currentQuestion.id_of_question},${event.option}`;
    this.dispatchPartsOfQuestions();
    this.chatservice.uploadAnswers(this.answer).subscribe();
  }

  startQuestions() {
    // come back here later!
    this.control = "questions";
    let questions = JSON.parse(sessionStorage.getItem("questions"));
    let btn = document.querySelector(".beginTest") as HTMLAnchorElement;
    // this.generalservice.loading4button(btn, "yes", "Loading...");
    if (!questions) {
      this.errorHouse.error = new Alert(
        true,
        "Sorry, we could not load the questions at this time. Please close the modal and try again!"
      );
      this.generalservice.loading4button(btn, "done", "Begin Test");
      this.generalservice.removeErrorAlert(this.errorHouse, 4000);
    } else if (questions.join("").includes("Sorry")) {
      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      // this.generalservice.responseDisplayNotifier("test_already_taken");
      this.generalservice.loading4button(btn, "done");
      sessionStorage.clear();
    } else {
      // console.log(questions);
      this.removeIntroPageAndDisplayQuestion(btn);
      // this.dispatchPartsOfQuestions();
    }
  }

  displayAnalysisPage() {
    // const successfulAnalysis = document.querySelector(
    //   ".successful-Analysis"
    // ) as HTMLDivElement;
    // successfulAnalysis.style.display = "block";
    this.notifyBackendThatGamePlayIsOver();
    this.control = "successful-Analysis";
    this.generalservice.timerController("dontShow");
  }

  endOfQuestioning() {
    // debugger;
    if (
      this.generalservice.counter == this.generalservice.totalLengthOfQuestions
    ) {
      this.generalservice.ctrlDisableTheButtonsOfPreviousListElement("allow");
      // this.generalservice.responseDisplayNotifier("questionsHasBeenAnswered");
      // console.log(this.generalservice.totalLengthOfQuestions);
      // console.log(this.generalservice.displayedQuestions.length);
      sessionStorage.clear();
      return;
    }
  }

  removeIntroPageAndDisplayQuestion(btn: HTMLAnchorElement) {
    // const introoverlay = document.querySelector(
    //   ".introoverlay"
    // ) as HTMLDivElement;
    // introoverlay.style.display = "none";
    this.control = "questions";
    this.generalservice.timerController("showTimer");
    this.generalservice.timerController("startTimer");
    // this.generalservice.loading4button(btn, "done");
  }

  // this function will tell user that he/she is done with questions
  //  then display analysis page.
  notifyTheUserThatTimeForQuestionHasElapsed() {
    if (
      this.generalservice.displayedQuestions.length <
      this.generalservice.totalLengthOfQuestions
    ) {
      let answer: { ref_no?: string; answer?: string } = {};
      answer.ref_no = sessionStorage.getItem("ref_no");
      for (let question of this.generalservice.allQuestions) {
        answer.answer = `${question.id},''`;
        this.chatservice.uploadAnswers(answer).subscribe();
      }
      this.generalservice.timerController("dontShow");
      // this.generalservice.declareThatTimeHasElapsed("timeHasElapsed");
      // this.generalservice.responseDisplayNotifier(
      //   "questionAnsweringIncomplete"
      // );
      return;
    }
    // this.generalservice.declareThatTimeHasElapsed("timeHasElapsed");
    this.generalservice.timerController("dontShow");
  }

  notifyBackendThatGamePlayIsOver() {
    this.chatservice.tellBackEndThatGamePlayisOver();
  }

  ngOnDestroy() {
    this.destroytimeHasElapsed.unsubscribe();
    this.destroyQuestionCtrl.unsubscribe();
    this.destroyQuestionsHasArrived.unsubscribe();
  }
}
