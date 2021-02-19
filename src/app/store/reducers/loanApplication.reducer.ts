


  import * as generalActions from "../actions/general.action";
  
  // interface for state
  export interface loanApplicationState {
    loan_application_process: 'not-processing' | 'processing' | 'failed' | 'success';
  }
  
  // Application state
  export const initialState: loanApplicationState = {
    loan_application_process: 'not-processing'
  };
  
  export function reducer(
    state = initialState,
    action: generalActions.checkLoanProcess
  ): loanApplicationState {
    switch (action.type) {
        case generalActions.tokenizeCardProcess: {
        return {
          ...state,
          loan_application_process: action.payload
        };
      }
    }
  
    return state;
  }