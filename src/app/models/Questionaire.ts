export interface QuestionsToAsk {
  id: string;
  question: string;
  answer_key: null;
  options: Array<{ option: string; value: any }>;
  answer_set: string;
  category_id: string;
  type: string;
  started_test_before: boolean;
  status: boolean;
  // questionHasfinished?: boolean
}

export interface DisplayQuestion {
  id?: number;
  id_of_question?: string;
  question?: string;
  options?: Array<{ option: string; value: any }>;
}

export interface PercentageOfQuestion {
  total_number?: number;
  current_perentage?: number;
  previous_percentage?: number;
}

export class Questionaire {
  question: string;
  answer: string;
  callBack: Function;
  constructor() {}
}
