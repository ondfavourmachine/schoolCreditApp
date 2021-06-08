import { Action } from "@ngrx/store";
import {
  ParentRegistration,
  Parent,
  AChild,
  ParentAccountInfo,
  SchoolDetailsModel,
 
  SchoolBookStructure,
  LoanRequest,
  Offers,
  TeacherDetails
} from "src/app/models/data-models";

// add Parent information
// ** types **
export const addParentInfo = "[parents] ADD PARENTS";
export const editParentInformation = "[parents] EDIT PARENT"
export const updateWidgetData = "[parents] UPDATE WIDGET DATA STAGE";
export const updateWidgetCard = "[parents] UPDATE WIDGET CARD";
export const updateWidgetCashflow = "[parents] UPDATE WIDGET CASH FLOW";
export const updateParentLoanStatus = "[parents] UPDATE LOAN REQUEST";
export const updateParentAcctInformation = "[parents] UPDATE PARENT ACCOUNT";
export const updateOffers = "[parents] UPDATE PARENT OFFERS";
export const updateReturningParent = "[parents] UPDATE RETURNING PARENT"
export const editBreakPoint = "[parents] EDITPARENTBREAKPOINT"
// 

// action classes for parent
export class returningParentHasBeenApproved implements Action{
  readonly type = updateReturningParent;
  constructor(public payload: {continuingrequest: string, nameOfParent: string}){}
}

export class updateParentOffers implements Action {
  readonly type = updateOffers;
  constructor(public payload: Array<Partial<Offers>>) {}
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

export class editParentInfo implements Action{
  readonly type = editParentInformation;
  constructor(public payload: boolean) {}
}

export class updateBreakPoint implements Action{
  readonly type = editBreakPoint;
  constructor(public payload: number){}
}



export type parentsAction =
  | addParents
  | updateParentWidgetCardStage
  | updateParentWidgetCashflowStage | editParentInfo
  | updateParentWidgetDataStage 
  | updateParentLoanRequest 
  | updateBreakPoint
  | updateParentAcctInfo | updateParentOffers | returningParentHasBeenApproved;



// add Child Information

export const addChildrenInfo = "[children] ADD CHILDREN";
export const calculateChildrenTuitionFees =
  "[children] CalculateChildreenTuition";
export const updateAChild = "[children] UPDATE CHILD INFO";
export const updateAChildTwo = "[children] UPDATE CHILD INFO";

export class addAChild implements Action {
  readonly type = addChildrenInfo;
  constructor(public payload: Map<string, Partial<AChild>>) {}
}

export class updateAllSingleChildInfo implements Action {
  readonly type = updateAChildTwo;
  constructor(
    public payload: { name: string; dataToChange: Partial<AChild> }
  ) {}
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




// actions for teacher
export enum teacherLoadingState{
  loading = '[teacher] Loading',
  loaded = '[teacher] loaded',
  failed = '[school] failed',
}

export class teacherDetailsIsLoading implements Action{
  readonly type = teacherLoadingState.loading;
  constructor(){}
}

export class teacherDetailsHasLoaded implements Action{
  readonly type= teacherLoadingState.loaded;
  constructor(public payload: Partial<TeacherDetails> ){}
}

export class teacherDetailsFailedToLoad implements Action{
  readonly type = teacherLoadingState.failed;
  constructor(){
  }
}


export type teacherActions = teacherDetailsHasLoaded | teacherDetailsFailedToLoad | teacherDetailsIsLoading;



