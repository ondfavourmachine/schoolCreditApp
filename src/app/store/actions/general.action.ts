import { Action } from "@ngrx/store";
import {
  ParentRegistration,
  Parent,
  AChild,
  ParentAccountInfo,
  SchoolDetailsModel,
 
  SchoolBookStructure,
  LoanRequest,
  Offers
} from "src/app/models/data-models";

// add Parent information
// ** types **
export const addParentInfo = "[parents] ADD PARENTS";
export const updateWidgetData = "[parents] UPDATE WIDGET DATA STAGE";
export const updateWidgetCard = "[parents] UPDATE WIDGET CARD";
export const updateWidgetCashflow = "[parents] UPDATE WIDGET CASH FLOW";
export const updateParentLoanStatus = "[parents] UPDATE LOAN REQUEST";
export const updateParentAcctInformation = "[parents] UPDATE PARENT ACCOUNT";
export const updateOffers = "[parents] UPDATE PARENT OFFERS";
// 

// action classes for parent
export class updateParentOffers implements Action {
  readonly type = updateOffers;
  constructor(public payload: Array<Offers>) {}
}

export class addParents implements Action {
  readonly type = addParentInfo;
  constructor(public payload: ParentRegistration | Parent) {}
}

export class updateParentWidgetDataStage implements Action {
  readonly type = updateWidgetData;
  constructor(public payload: 0 | 1 ) {}
}

export class updateParentWidgetCashflowStage implements Action {
  readonly type = updateWidgetCashflow;
  constructor(public payload: 0 | 1) {}
}

export class updateParentWidgetCardStage implements Action {
  readonly type = updateWidgetCard;
  constructor(public payload: 0 | 1) {}
}

export class updateParentLoanRequest implements Action{
  readonly type = updateParentLoanStatus;
  constructor(public payload: LoanRequest){}
}

export class updateParentAcctInfo implements Action {
  readonly type = updateParentAcctInformation;
  constructor(public payload: Partial<ParentAccountInfo>) {}
}



export type parentsAction =
  | addParents
  | updateParentWidgetCardStage
  | updateParentWidgetCashflowStage
  | updateParentWidgetDataStage | updateParentLoanRequest | updateParentAcctInfo | updateParentOffers;



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



// tokenizeCard Actions

export const tokenizeCardProcess = "[card] check card token process";

export class checkTokenizeProcess implements Action {
  readonly type = tokenizeCardProcess;
  constructor(
    public payload: 'not-checking' | 'checking' | 'failed' | 'success'
  ) {}
}

export type tokenizeCardActions = checkTokenizeProcess ;


// loan Application Actions

export const loanProcess = "[card] check loan process";

export class checkLoanProcess implements Action {
  readonly type = tokenizeCardProcess;
  constructor(
    public payload: 'not-processing' | 'processing' | 'failed' | 'success'
  ) {}
}

export type loanActions = checkLoanProcess ;



export enum schoolLoadingState{
  loading = '[school] Loading',
  loaded = '[school] loaded',
  failed = '[school] failed',
  completed = '[school] completed'
}

// school actions start here
export const updateSchoolInformation = "[school] UPDATE SCHOOL";
export const AddSchoolBooks = "[school] ADD SCHOOL BOOKS";
// export const loadedSchoolState = "[school] LOADED";
// export const loadingSchoolStateFailes = "[school] Failed";

export class loadSchoolDetails implements Action{
  readonly type = updateSchoolInformation;
  constructor(public payload: SchoolDetailsModel){

  }
}

export class updateSchoolBooks implements Action{
  readonly type = AddSchoolBooks;
  constructor(public payload: SchoolBookStructure){

  }
}


export class schoolDetailsIsLoading implements Action{
  readonly type = schoolLoadingState.loading;
  constructor(){
  }
}

export class schoolDetailsLoadingIsCompleted implements Action{
  readonly type = schoolLoadingState.completed;
  constructor(){
  }
}

export class schoolDetailsIsLoaded implements Action{
  readonly type = schoolLoadingState.loaded;
  constructor(){
  }
}

export class schoolDetailsFailedToLoad implements Action{
  readonly type = schoolLoadingState.failed;
  constructor(){
  }
}

export type schoolActions  = updateSchoolBooks | 
loadSchoolDetails | schoolDetailsLoadingIsCompleted | 
schoolDetailsFailedToLoad | schoolDetailsIsLoaded | 
schoolDetailsIsLoading







