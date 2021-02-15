


  import { SchoolBook, SchoolDetailsModel } from "src/app/models/data-models";
import * as generalActions from "../actions/general.action";
  
  // interface for state
  export interface SchoolDetails {
    school_Info: Partial<SchoolDetailsModel>,
    school_Info_Load_state: 'loading' | 'loaded' |'failed' | 'completed' | undefined,
    school_books: Array<SchoolBook>
  }
  
  // Application state
  export const initialState: SchoolDetails = {
    school_Info: {},
    school_Info_Load_state: undefined,
    school_books : []
  };
  
  export function reducer(
    state = initialState,
    action: generalActions.schoolActions
  ): SchoolDetails {
    switch (action.type) {
      case generalActions.AddSchoolBooks: {
        return {
          ...state,
          school_books: [...state.school_books, ...action.payload]
        };
      }
        case generalActions.updateSchoolInformation: {
        return {
          ...state,
          school_Info: action.payload
        };
      }
      case generalActions.schoolLoadingState.loading: {
        return {
          ...state,
          school_Info_Load_state : 'loading'
        };
      }
      case generalActions.schoolLoadingState.completed: {
        return {
          ...state,
          school_Info_Load_state : 'completed'
        };
      }
      case generalActions.schoolLoadingState.loaded: {
        return {
          ...state,
          school_Info_Load_state : 'loaded'
        };
      }
      case generalActions.schoolLoadingState.failed: {
        return {
          ...state,
          school_Info_Load_state : 'failed'
        };
      }
    }
  
    return state;
  }
  