import { Action } from "@ngrx/store";
import { ParentRegistration, Parent } from "src/app/models/data-models";

// add Parent information

export const addParentInfo = "[parents] ADD PARENTS";

export class addParents implements Action {
  readonly type = addParentInfo;
  constructor(public payload: ParentRegistration | Parent) {}
}

export type parentsAction = addParents;
