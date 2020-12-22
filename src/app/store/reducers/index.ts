import * as fromParentReducerFile from "./general.reducer";
import { ActionReducerMap } from "@ngrx/store";

export interface AllState {
  parent_info: Partial<fromParentReducerFile.ParentState>;
}

export const reducers: ActionReducerMap<AllState> = {
  parent_info: fromParentReducerFile.reducer
};
