import {
  Parent,
  ParentWorkInfo,
  ParentAddressInfo,
  ParentIdInfo
} from "src/app/models/data-models";
import * as generalActions from "../actions/general.action";

// interface for state
export interface ParentState {
  parent_info: Partial<Parent>;
  parent_work_info: Partial<ParentWorkInfo>;
  parent_address_info: Partial<ParentAddressInfo>;
  parent_ID_info: Partial<ParentIdInfo>;
}

// Application state
export const initialState: ParentState = {
  parent_info: { OTP_sent: false },
  parent_work_info: {},
  parent_address_info: {},
  parent_ID_info: {}
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

    case generalActions.updateParentWorkInfo: {
      return {
        ...state,
        parent_work_info: { ...state.parent_work_info, ...action.payload }
      };
    }

    case generalActions.updateParentAddress: {
      return {
        ...state,
        parent_address_info: { ...state.parent_address_info, ...action.payload }
      };
    }

    case generalActions.updataParentID: {
      return {
        ...state,
        parent_ID_info: { ...state.parent_ID_info, ...action.payload }
      };
    }
  }

  return state;
}
