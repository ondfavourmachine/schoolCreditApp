import {Component, EventEmitter, OnInit, Output,  } from "@angular/core";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { pluck } from "rxjs/operators";
import { SchoolBook } from "src/app/models/data-models";
  
  
  
  @Component({
    selector: "app-school-books",
    templateUrl: "./school-books.component.html",
    styleUrls: ["./school-books.component.css"]
  })
  export class SchoolBooksComponent implements OnInit  {
    @Output("previousPage") previousPage = new EventEmitter<string>();
    destroy: Subscription[] = [];
    selected: string = '';
    booksToDisplay: SchoolBook[] = []
    constructor(private store: Store) {
        this.previousPage.emit("firstPage");
    }

    ngOnInit(){
        this.destroy[0]= this.store.select(fromStore.getSchoolDetailsState)
        .pipe(pluck('school_books')).subscribe((val: SchoolBook[]) => {
            this.booksToDisplay = [...val];
        })
    }
  }