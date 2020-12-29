import {
  Parent,
  AChild,
  BankPartnership,
  AccountDetails
} from "src/app/models/data-models";
import * as generalActions from "../actions/general.action";

// interface for state
export interface ParentState {
  parent_info: Partial<Parent>;
}

// Application state
export const initialState: ParentState = {
  parent_info: { OTP_sent: false }
};

export function reducer(
  state = initialState,
  action: generalActions.parentsAction
): ParentState {
  switch (action.type) {
    case generalActions.addParentInfo: {
      return {
        ...state,
        parent_info: { ...state.parent_info, ...action.payload }
      };
    }
  }

  return state;
}
