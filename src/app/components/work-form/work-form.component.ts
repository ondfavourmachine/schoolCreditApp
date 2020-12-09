import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-work-form',
  templateUrl: './work-form.component.html',
  styleUrls: ['./work-form.component.css']
})
export class WorkFormComponent implements OnInit {
  @Output() changeUpTheViewTwo = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }

}
