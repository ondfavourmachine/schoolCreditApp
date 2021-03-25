
import {
  LoanRequest,
  Offers,
  Parent,
  ParentAccountInfo,
} from "src/app/models/data-models";
import * as generalActions from "../actions/general.action";

// interface for state
export interface ParentState {
  parent_info: Partial<Parent>;
  widget_data?: 0 | 1,
  widget_cashflow?: 0 | 1,
  widget_card?: 0 | 1,
  offers: Array<Partial<Offers>>,
  parent_loan_request_status: Partial<LoanRequest>,
  parent_account_info: Partial<ParentAccountInfo>;
  editMode: boolean
}

// Application state
export const initialState: ParentState = {
  parent_info: { type: "1", OTP_sent: false },
  // widget_data: 0,
  // widget_cashflow: 0,
  // widget_card: 0,
  offers: [],
  parent_loan_request_status: {creditclan_request_id: null, eligible: false},
  parent_account_info: {},
  editMode: false
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

    case generalActions.updateWidgetData: {
      // const obj = {...state}
      // if(!obj.hasOwnProperty('widget_data') && (action.payload == 0 || action.payload == 1)){
      //   return {...obj, widget_cashflow: action.payload};
      // }else{
      //   return {
      //     ...obj,
      //   };
      // }

      return {
        ...state,
        widget_data: action.payload
      };
      
    }

    case generalActions.updateWidgetCashflow: {
      // const obj = {...state}
      // if(!obj.hasOwnProperty('widget_cashflow') && action.payload == 1){
      //   return {...obj, widget_cashflow: action.payload};
      // }else{
      //   return {
      //     ...obj,
      //   };
      // }

      return {
        ...state,
        widget_cashflow: action.payload
      };
      
    }

    case generalActions.updateWidgetCard: {
      // const obj = {...state};
      // if(!obj.hasOwnProperty('widget_card') && action.payload == 1){
      //   return {...obj, widget_card: action.payload};
      // }else{
      //   return {
      //     ...obj
      //   }
      // }
      return {
        ...state,
        widget_card: action.payload
      };
    }

    case generalActions.updateParentAcctInformation: {
      return {
        ...state,
        parent_account_info: { ...state.parent_account_info, ...action.payload }
      };
    }


    case generalActions.updateParentLoanStatus: {
      return {
        ...state,
        parent_loan_request_status: { ...state.parent_loan_request_status, ...action.payload }
      };
    }

    case generalActions.updateOffers: {
      const store = { ...state };
      store.offers = [];
      store.offers = [...action.payload];
      return store;
    }
    case generalActions.editParentInformation: {
      return {
        ...state,
        editMode : action.payload
      }
    }
    
  }

  return state;
}
