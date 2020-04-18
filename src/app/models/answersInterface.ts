export interface QuestionsAndAnswers {
  currentRemovedQuestion?: string;
  allRemovedQuestions: string[];
  questionsAndAnswersToSend: { [propname: string]: string };
}
