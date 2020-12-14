import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { sandBoxData } from "src/app/models/sandboxData";

interface State {
  id: string;
  value: string;
}
@Component({
  selector: "app-address-form",
  templateUrl: "./address-form.component.html",
  styleUrls: ["./address-form.component.css"]
})
export class AddressFormComponent implements OnInit {
  @Output() changeUpTheViewThree = new EventEmitter<string>();
  NigerianStates: State[] = [];
  constructor() {
    this.NigerianStates = sandBoxData().data.states;
  }

  ngOnInit(): void {}
}
