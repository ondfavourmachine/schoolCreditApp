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
    @Output("selectionComplete") selectionComplete = new EventEmitter<SchoolBook[]>();
    destroy: Subscription[] = [];
    selected: string = '';
    booksToDisplay: SchoolBook[] = [];
    booksSelected: Set<number | string> = new Set();
    totalCostOfBooks: number;
    noBookFromSchool;
    searchTerm: string;
    showDropdown: boolean = false;
    view : 'book-selection' | 'cost' | '' = 'book-selection'
    constructor(private store: Store) {
        this.previousPage.emit("firstPage");
    }

    ngOnInit(){
        this.destroy[0]= this.store.select(fromStore.getSchoolDetailsState)
        .pipe(pluck('school_books')).subscribe((val: SchoolBook[]) => {
            this.booksToDisplay = [...val];
        })
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
     this.booksSelected.forEach((id) => {
         const foundBook = this.booksToDisplay.find(elem => elem.id == id);
         if(foundBook) totalCostsOfBooks += parseInt(foundBook.price)
     })
    //  console.log(totalCostsOfBooks)
     this.totalCostOfBooks = totalCostsOfBooks
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
        const books: SchoolBook[] = []
        this.booksSelected.forEach((id) => {
            const foundBook = this.booksToDisplay.find(elem => elem.id == id);
           books.push(foundBook);
        })
        this.selectionComplete.emit(books);
    }
  }