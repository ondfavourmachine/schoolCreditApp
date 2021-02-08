import * as fromParentReducerFile from "./parent.reducer";
import * as fromChildrenReducerFile from "./children.reducer";
import * as fromTokenizeCardReducerFile from "./tokenize-card.reducer";
import * as fromSchoolInfoReducerFile from "./schoolDetails.reducer"
import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from "@ngrx/store";

export interface AllState {
  parent_info: Partial<fromParentReducerFile.ParentState>;
  children_info: fromChildrenReducerFile.ChildrenState;
  tokenize_process: fromTokenizeCardReducerFile.tokenizeCardState
  schoolDetails: fromSchoolInfoReducerFile.SchoolDetails
}

export const reducers: ActionReducerMap<AllState> = {
  parent_info: fromParentReducerFile.reducer,
  children_info: fromChildrenReducerFile.reducer,
  tokenize_process: fromTokenizeCardReducerFile.reducer,
  schoolDetails: fromSchoolInfoReducerFile.reducer
};

// building Selectors for Children

export const getCurrentChildState = createFeatureSelector<AllState>(
  "manageChild"
);

export const getParentState = createFeatureSelector<AllState>("manageParent");

export const getCardTokenState = createFeatureSelector<AllState>("manageCardTokenization");

export const getSchoolDetailsState = createFeatureSelector<AllState>("schoolDetails");



// then get the child_info reducer
//  this right here worked
export const getCurrentChildInfo = createSelector(
  getCurrentChildState,
  (state: AllState) => state.children_info
);

export const getCurrentParentInfo = createSelector(
  getParentState,
  (state: AllState) => state.parent_info
);


// then get the actual child_info which is a Map()
// export const fetchMapOfChildInfoFromReducer = createSelector(
//   getCurrentChildInfo,
//   fromChildrenReducerFile.aMapOfChildrenInfo
// );

// export const fetchActualTotalTuition = createSelector(
//   getCurrentChildInfo,
//   fromChildrenReducerFile.totalTuitionOfAllChild
// );
