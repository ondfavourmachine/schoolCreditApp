import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class StoreService {
  childrenInformationSubmittedByParent: Array<{
    name?: string;
    class?: string;
    tuition_fees?: any;
    index?: number;
  }> = [];
  constructor() {}
}
