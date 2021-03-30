import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { ChatService } from "src/app/services/ChatService/chat.service";
import { GeneralService } from "src/app/services/generalService/general.service";
// import { timeout } from "rxjs/operators";
import { DisplayQuestion } from "src/app/models/Questionaire";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { delay, map, tap } from "rxjs/operators";


@Component({
  selector: "app-chat-bot",
  templateUrl: "./chat-bot.component.html",
  styleUrls: ["./chat-bot.component.css"]
})
export class ChatBotComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input('schoolName') schoolName: string
  messages: string | { message: string; direction: string; button?: string };
  public referenceNumber: string;
  private destroyAnything: Subscription[] = [];
  actionToTake: string;
  @ViewChild("parentContainer") parentContainer: ElementRef;
  // timeHasElapsed: number = 0;
  constructor(
    private chatservice: ChatService,
    private generalservice: GeneralService,
    private router: Router,
    private store: Store,
    private changeDetection: ChangeDetectorRef
  ) {}

   async ngOnChanges(changes: SimpleChanges){
      // console.log(changes);
      if(changes.schoolName.currentValue){
        this.store.dispatch(new generalActions.schoolDetailsIsLoading());
        try {
           const res = await this.chatservice.fetchSchoolDetails(changes.schoolName.currentValue);
           const {school} = res.data;
           this.store.dispatch(new generalActions.loadSchoolDetails(school));
           this.store.dispatch(new generalActions.addParents({school_id: school.id}));
           this.store.dispatch(new generalActions.schoolDetailsIsLoaded());
          //  will remove this later
           sessionStorage.setItem('school_classes', JSON.stringify(school.classes));
        } catch (error) {
           this.store.dispatch(new generalActions.schoolDetailsFailedToLoad())
        }
       
          
      }
     
    }

  ngOnInit() {
    this.destroyAnything[0] = this.generalservice.startAskingAndChangeQuestions$.subscribe(
      val => {
        // do something here
      },
      err => console.log(err)
    );

    // this.store.select(fromStore.getSchoolDetailsState).subscribe(val => console.log(val))

    this.destroyAnything[1]= this.store.select(fromStore.getSchoolDetailsState)
    .pipe(delay(1000),tap(val => {
      if(val["school_Info"].hasOwnProperty('id') && !sessionStorage.getItem('school_avatar')){
        sessionStorage.setItem('school_avatar', val["school_Info"].picture); 
      }
    }), map((val) => {
      return {schoolInfoLoadState : val['school_Info_Load_state'], school_id: val['school_Info']['id'], }
    }))
    .subscribe((val) => this.fetchSchoolBooks(val.school_id, val.schoolInfoLoadState))

    this.changeDetection.detectChanges();
    this.chatservice.fetchBankNames();
  }

  ngAfterViewInit() {
    const div = this.parentContainer.nativeElement as HTMLDivElement;
    const scoller = document.querySelector(".chat-box");
    const chat = document.querySelector(".chat_window");
    chat.addEventListener("DOMNodeInserted", e => {
      scoller.scrollBy({
        left: 0,
        top: scoller.scrollHeight,
        behavior: "smooth"
      });
    });
  }

  fetchSchoolBooks(schoolId, schoolLoadState: 'loading' | 'loaded' | 'failed'){
    // console.log(schoolId, schoolLoadState);
      if(schoolLoadState == 'loaded'){
        this.chatservice.getAllBooksFromSchool(schoolId)
         .subscribe(val => { 
           this.store.dispatch(new generalActions.schoolDetailsLoadingIsCompleted());
           this.store.dispatch(new generalActions.updateSchoolBooks(val.data));
           
         }, err => {
           this.generalservice.errorNotification('Could not load books associated with school!')
           console.log(err);
         })
      }else{
        // console.log('i am here!')
      }
  }

  sendMessageFromInput(event) {
    this.messages = event;
  }

  handleReadyOrNot(event: string) {
    event = event.toLowerCase();
    switch (event) {
      case "y":
        setTimeout(() => {
          this.sendMessageFromInput({
            message: `Awesome! Please be aware that you will be timed. 
          Try to answer as fast and as truthfully as you can. Your time starts now!`,
            direction: "left"
          });
          this.generalservice.timerController("showTimer");
          this.userWantsToStartAnsweringQuestions();
        }, 1000);
        // this.userWantsToStartAnsweringQuestions();
        break;
      case "n":
        break;
    }
  }

  changeActionInput(event: string) {
    this.actionToTake = event;
    // console.log(this.actionToTake);
  }

  userWantsToStartAnsweringQuestions() {
    setTimeout(() => {
      this.userHasStartedQuestions();
    }, 1500);
  }

  // this function will kick start the sending of questions to the display component!
  userHasStartedQuestions() {
    setTimeout(() => {
      this.generalservice.handleQuestioningProcess("start");
      this.generalservice.timerController("startTimer");
    }, 1000);
  }

  showUserQuestions(temp: Array<DisplayQuestion>): void {
    setTimeout(() => {
      this.sendMessageFromInput({
        message: `${temp[0].question} 
         ${temp[0].options}
           `,
        direction: "left"
      });
      temp.splice(0, 1);
    }, 500);
  }

  // this function will restart the questioning process
  // when it receives an event from app-chat-messages-display restartProcess eventEmitter
  callNgOnInitAgain() {
    console.log(' i am here ')
    sessionStorage.clear();
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.destroyAnything.forEach(elem => elem.unsubscribe());
  }
}
