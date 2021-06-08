
  import { TeacherDetails } from "src/app/models/data-models";
  import * as generalActions from "../actions/general.action";
    
    // interface for state
    export interface TeacherState {
      teacher_Info: Partial<TeacherDetails>,
      teacher_Info_Load_state: 'loading' | 'loaded' |'failed' | 'completed' | 'initial',
    }
    
    // Application state
    export const initialState: TeacherState = {
      teacher_Info: {},
      teacher_Info_Load_state:'initial'
    };
    
    export function reducer(
      state = initialState,
      action: generalActions.teacherActions
    ): TeacherState {
      switch (action.type) {
        case generalActions.teacherLoadingState.loaded: {
          // console.log(action.payload);
          return {
            ...state,
            teacher_Info: action.payload,
            teacher_Info_Load_state: 'loaded'
            // school_books: [...state.school_books, ...action.payload.books]
          };
        }
          case generalActions.teacherLoadingState.loading: {
          return {
            ...state,
            teacher_Info_Load_state: 'loading'
          };
        }
        case generalActions.teacherLoadingState.failed: {
          return {
            ...state,
            teacher_Info_Load_state : 'failed'
          };
        }
       
       
      }
    
      return state;
    }
    