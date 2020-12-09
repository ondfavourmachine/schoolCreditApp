import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.css']
})
export class ProfileFormComponent implements OnInit {
@Output() changeUpTheViewThree = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }

}
