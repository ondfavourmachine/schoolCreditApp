import * as fromParentReducerFile from "./parent.reducer";
import * as fromChildrenReducerFile from "./children.reducer";
import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from "@ngrx/store";

export interface AllState {
  parent_info: Partial<fromParentReducerFile.ParentState>;
  child_info: fromChildrenReducerFile.ChildrenState;
}

export const reducers: ActionReducerMap<AllState> = {
  parent_info: fromParentReducerFile.reducer,
  child_info: fromChildrenReducerFile.reducer
};

// building Selectors for Children

export const getCurrentChildState = createFeatureSelector<AllState>(
  "manageChild"
);

// then get the child_info reducer
//  this right here worked
export const getCurrentChildInfo = createSelector(
  getCurrentChildState,
  (state: AllState) => state.child_info
);

// then get the actual child_info which is a Map()
export const fetchMapOfChildInfoFromReducer = createSelector(
  getCurrentChildInfo,
  fromChildrenReducerFile.aMapOfChildrenInfo
);

export const fetchActualTotalTuition = createSelector(
  getCurrentChildInfo,
  fromChildrenReducerFile.totalTuitionOfAllChild
);
