import { Injectable } from "@angular/core";
import { AChild } from "src/app/models/data-models";

@Injectable({
  providedIn: "root"
})
export class StoreService {
  childrenInformationSubmittedByParent: Array<Partial<AChild>> = [];
  constructor() {}
}
