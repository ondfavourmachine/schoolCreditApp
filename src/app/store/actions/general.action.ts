import { Action } from "@ngrx/store";
import {
  ParentRegistration,
  Parent,
  AChild,
  ParentWorkInfo,
  ParentAddressInfo,
  ParentIdInfo
} from "src/app/models/data-models";

// add Parent information

export const addParentInfo = "[parents] ADD PARENTS";
export const updateParentWorkInfo = "[parents] UPDATE PARENT WORK INFO";
export const updateParentAddress = "[parents] UPDATE PARENT ADDRESS";
export const updataParentID = "[parents] UPDATE PARENT IDENTIFICATION";

export class addParents implements Action {
  readonly type = addParentInfo;
  constructor(public payload: ParentRegistration | Parent) {}
}

export class updateParentWorkInformation implements Action {
  readonly type = updateParentWorkInfo;
  constructor(public payload: ParentWorkInfo) {}
}

export class updateParentAddressInfo implements Action {
  readonly type = updateParentAddress;
  constructor(public payload: Partial<ParentAddressInfo> & Partial<Parent>) {}
}

export class updateParentIDInformation implements Action {
  readonly type = updataParentID;
  constructor(public payload: Partial<ParentIdInfo>) {}
}

export type parentsAction =
  | addParents
  | updateParentWorkInformation
  | updateParentAddressInfo
  | updateParentIDInformation;

// add Child Information

export const addChildrenInfo = "[children] ADD CHILDREN";
export const calculateChildrenTuitionFees =
  "[children] CalculateChildreenTuition";
export const updateAChild = "[children] UPDATE CHILD INFO";

export class addAChild implements Action {
  readonly type = addChildrenInfo;
  constructor(public payload: Map<string, Partial<AChild>>) {}
}

export class calculateFees implements Action {
  readonly type = calculateChildrenTuitionFees;
  constructor() {}
}

export class modifyIndividualChild implements Action {
  readonly type = updateAChild;
  constructor(
    public payload: { name: string; dataToChange: Partial<AChild> }
  ) {}
}

export type childrenAction = addAChild | calculateFees | modifyIndividualChild;
