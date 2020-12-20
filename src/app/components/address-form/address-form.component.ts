import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { sandBoxData } from "src/app/models/sandboxData";
import { LgaData } from "src/app/models/lgaData";

interface State {
  id: string;
  value: string;
}

interface LGA extends State {}
@Component({
  selector: "app-address-form",
  templateUrl: "./address-form.component.html",
  styleUrls: ["./address-form.component.css"]
})
export class AddressFormComponent implements OnInit {
  @Output() changeUpTheViewThree = new EventEmitter<string>();
  NigerianStates: State[] = [];
  stateLgas: LGA[] = [];
  lgaData: any = {};
  constructor() {
    this.NigerianStates = sandBoxData().data.states;
    this.lgaData = { ...LgaData() };
  }

  ngOnInit(): void {}

  selectLgaInState(value: string) {
    const selectedLga = this.lgaData[value];
    this.stateLgas = selectedLga.data;
  }
}
