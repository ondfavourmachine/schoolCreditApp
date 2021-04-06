import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,  } from "@angular/core";
import { Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import * as fromStore from "../../store";
import * as generalActions from "../../store/actions/general.action";
import { pluck } from "rxjs/operators";
import { SchoolBook } from "src/app/models/data-models";
  
 type schoolbookviews = 'book-selection' | 'cost' | ''; 
  
  @Component({
    selector: "app-school-books",
    templateUrl: "./school-books.component.html",
    styleUrls: ["./school-books.component.css"]
  })
  export class SchoolBooksComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    @Output("previousPageInSchool") previousPageInSchool = new EventEmitter<{}>();
    @Output("selectionComplete") selectionComplete = new EventEmitter<SchoolBook[]>();
    @Output('goback') goback = new EventEmitter<string>();
    @Output('skip') skip = new EventEmitter<string>();
    @Input() nextOrPrev: Object = {};
    destroy: Subscription[] = [];
    selected: string = '';
    booksToDisplay: SchoolBook[] = [];
    booksSelected: Set<number | string> = new Set();
    totalCostOfBooks: number;
    noBookFromSchool;
    searchTerm: string;
    showDropdown: boolean = false;
    previous: string & schoolbookviews = '';
    view: schoolbookviews = 'book-selection'
    pageViews: schoolbookviews[] = [
      'book-selection',
      'cost'
      ];
    constructor(private store: Store) {
        this.manageGoingBackAndForth = this.manageGoingBackAndForth.bind(this);
    }

    ngOnChanges(){
        // console.log(this.nextOrPrev);
    }

    ngOnInit(){
        this.destroy[0]= this.store.select(fromStore.getSchoolDetailsState)
        .pipe(pluck('school_books')).subscribe((val: SchoolBook[]) => {
            this.booksToDisplay = [...val];
        })
      this.goback.emit('upload-image');
    }

    ngAfterViewInit(){
        document
        .getElementById("backspace")
        .addEventListener("click", this.manageGoingBackAndForth);
    }

    manageGoingBackAndForth() {
        // this works because this component first catches the event, modifies the bookselected
        // while the event continues
        if(this.booksSelected.size > 0){
            this.booksSelected.clear();
            this.previousPageInSchool.emit('');
        }
        if(this.nextOrPrev) {
            this.view =  this.nextOrPrev['pageToShow'];
        }
      }


    addThisBookToSelected(event: Event){
        const input = event.target as HTMLInputElement;
        if(input.checked){
        this.booksSelected.add(input.id);
        const div = input.parentElement as HTMLDivElement;
        div.classList.add('selectedBookMarker');
        return;
        }
      
        this.booksSelected.delete(input.id);
        
        const div = input.parentElement as HTMLDivElement;
        div.classList.remove('selectedBookMarker');
    }

    selectAllBooks(event){
        const selectionInputs = (document.querySelectorAll('.selectionInput') as NodeListOf<HTMLInputElement>);
        if((event.target as HTMLInputElement).checked){
            selectionInputs.forEach(element => {
                element.checked = true;
                this.booksSelected.add(element.id);
                const div = element.parentElement as HTMLDivElement;
               div.classList.add('selectedBookMarker');
            })
        }else{
            selectionInputs.forEach(element => {
                element.checked = false;
                this.booksSelected.delete(element.id);
                const div = element.parentElement as HTMLDivElement;
                div.classList.remove('selectedBookMarker');
            })
        }
        
    }

    cancelAllSelection(){
        const selectionInputs = (document.querySelectorAll('.selectionInput') as NodeListOf<HTMLInputElement>);
        
        selectionInputs.forEach(element => {
            element.checked = false;
            this.booksSelected.delete(element.id);
        }) 
    }

    calculateTotalCostOfBooks(){
    let totalCostsOfBooks = 0;
    if(this.booksSelected.size == 0) return;
     this.booksSelected.forEach((id) => {
         const foundBook = this.booksToDisplay.find(elem => elem.id == id);
         if(foundBook) totalCostsOfBooks += parseInt(foundBook.price)
     })
     this.totalCostOfBooks = totalCostsOfBooks;
     this.previous = 'book-selection';
     this.previousPageInSchool.emit({pageToShow : this.previous});
     this.view = 'cost';
    }

    clickSelectAll(elem: string, event: Event){

        document.getElementById(elem).click();
        const anchorTag = event.target as HTMLAnchorElement;
        if(this.booksSelected.size == this.booksToDisplay.length){
          anchorTag.innerHTML = `<i class="fa fa-plus-circle"></i> Unselect all`;
        }else{
            anchorTag.innerHTML = `<i class="fa fa-plus-circle"></i> Select all`;
        }
    }

    clickThisInput(elem: string, event: Event){
        const target = event.target as HTMLDivElement
        document.getElementById(elem).click();
        const isthere = this.booksSelected.has(elem.toString());
        isthere ? target.textContent = 'unselect': target.textContent = 'select';
    }

    completeBookSelection(){
        const books: SchoolBook[] = [];
        this.booksSelected.forEach((id) => {
            const foundBook = this.booksToDisplay.find(elem => elem.id == id);
           books.push(foundBook);
        })
        this.previousPageInSchool.emit('');
        this.goback.emit('select-books');
       
        this.selectionComplete.emit(books);
    }

    skippingThisSection(){
        this.skip.emit('skip')
    }

    ngOnDestroy(){
        document
        .getElementById("backspace")
        .removeEventListener("click", this.manageGoingBackAndForth);
    }
  }