import {
    Parent,
    ParentWorkInfo,
    ParentAddressInfo,
    ParentIdInfo,
    ParentAccountInfo,
    ParentCreditCardInfo
  } from "src/app/models/data-models";
  import * as generalActions from "../actions/general.action";
  
  // interface for state
  export interface tokenizeCardState {
    state_of_process: 'not-checking' | 'checking' | 'failed' | 'success';
  }
  
  // Application state
  export const initialState: tokenizeCardState = {
    state_of_process: 'not-checking'
  };
  
  export function reducer(
    state = initialState,
    action: generalActions.tokenizeCardActions
  ): tokenizeCardState {
    switch (action.type) {
        case generalActions.tokenizeCardProcess: {
        return {
          ...state,
          state_of_process: action.payload
        };
      }
    }
  
    return state;
  }
  