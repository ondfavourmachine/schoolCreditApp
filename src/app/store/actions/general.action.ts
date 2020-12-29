import { Action } from "@ngrx/store";
import { ParentRegistration, Parent, AChild } from "src/app/models/data-models";

// add Parent information

export const addParentInfo = "[parents] ADD PARENTS";

export class addParents implements Action {
  readonly type = addParentInfo;
  constructor(public payload: ParentRegistration | Parent) {}
}

export type parentsAction = addParents;

// add Child Information

export const addChildrenInfo = "[children] ADD CHILDREN";
export const calculateChildrenTuitionFees =
  "[children] CalculateChildreenTuition";

export class addAChild implements Action {
  readonly type = addChildrenInfo;
  constructor(public payload: Map<string, Partial<AChild>>) {}
}

export class calculateFees implements Action {
  readonly type = calculateChildrenTuitionFees;
  constructor() {}
}

export type childrenAction = addAChild | calculateFees;
