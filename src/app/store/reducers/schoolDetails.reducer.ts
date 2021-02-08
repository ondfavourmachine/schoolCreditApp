


  import { SchoolDetailsModel } from "src/app/models/data-models";
import * as generalActions from "../actions/general.action";
  
  // interface for state
  export interface SchoolDetails {
    school_Info: Partial<SchoolDetailsModel>
  }
  
  // Application state
  export const initialState: SchoolDetails = {
    school_Info: {}
  };
  
  export function reducer(
    state = initialState,
    action: generalActions.schoolActions
  ): SchoolDetails {
    switch (action.type) {
        case generalActions.updateSchoolInformation: {
        return {
          ...state,
          school_Info: action.payload
        };
      }
    }
  
    return state;
  }
  