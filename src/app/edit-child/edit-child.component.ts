import { Component, OnInit } from '@angular/core';

type views = "" | 'edit-profile-info' | 'edit-picture';

@Component({
  selector: 'app-edit-child',
  templateUrl: './edit-child.component.html',
  styleUrls: ['./edit-child.component.css']
})
export class EditChildComponent implements OnInit {
  view: views = '';

  constructor() { }

  ngOnInit(): void {
  }

}
