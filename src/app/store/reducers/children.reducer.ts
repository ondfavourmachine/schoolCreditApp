import { AChild } from "src/app/models/data-models";
import * as generalActions from "../actions/general.action";

// interface for state
export interface ChildrenState {
  child_info: Map<string, Partial<AChild>>;
  total_tuition_fees: number;
}

// Application state
export const initialState: ChildrenState = {
  child_info: new Map(),
  total_tuition_fees: 0
};

export function reducer(
  state = initialState,
  action: generalActions.childrenAction
): ChildrenState {
  switch (action.type) {
    case generalActions.addChildrenInfo: {
      return {
        ...state,
        child_info: action.payload
      };
    }
    case generalActions.calculateChildrenTuitionFees: {
      const childInfoArray = Array.from(state.child_info.values());
      let total = childInfoArray.reduce((acc, current, currentIndex, array) => {
        return acc + +current.tuition_fees;
      }, 0);
      return {
        ...state,
        total_tuition_fees: total
      };
    }

    case generalActions.updateAChild: {
      const keyInMapOfChild = action.payload.name;
      const partOfChildToReplace = action.payload.dataToChange;
      let mapOfChildren = state.child_info;
      let childToChange = mapOfChildren.get(keyInMapOfChild);
      childToChange = {
        ...childToChange,
        child_id: partOfChildToReplace.child_id
      };
      mapOfChildren.set(keyInMapOfChild, childToChange);
      return {
        ...state,
        child_info: mapOfChildren
      };
    }

    case generalActions.updateAChildTwo: {
      const keyInMapOfChild = action.payload.name;
      const partOfChildToReplace = action.payload.dataToChange;
      let mapOfChildren = state.child_info;
      let childToChange = mapOfChildren.get(keyInMapOfChild);
      childToChange = {
        ...childToChange,
        ...partOfChildToReplace
      };
      mapOfChildren.set(keyInMapOfChild, childToChange);
      return {
        ...state,
        child_info: mapOfChildren
      };
    }
  }

  return state;
}

// compose different levels of state for easy selection
// This is the preamble to building selectors. The selectors will be build in the index.ts file of this folder
export const totalTuitionOfAllChild = (state: ChildrenState) =>
  state.total_tuition_fees;
export const aMapOfChildrenInfo = (state: ChildrenState) => state.child_info;
