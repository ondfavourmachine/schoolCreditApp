import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {
  questionsToAsk: Map<string, Record<string, any>> = new Map();
  currentQuestion: {[k: string]: string} = {};
  answeredQuestions: Array<Record<string, string>>= [];
  iterator: Iterator<any>;
  iteratorForKeys: Iterator<any>;
  answerFromUser: Array<Record<string, string>> = [];
  collectedAnswer: Map<string, Record<string, any>> = new Map();
  stringIndexOfCurrentQuestion: string;
  view: 'questionnaire' | 'done' =  'questionnaire';

  constructor() { }

  ngOnInit(): void {
    [ 'How long have you known him?']
    this.questionsToAsk.set('first', {question: 'Do you know Bukunmi?', answers: ['Yes', 'No', 'Probably', 'I cant remember']});
    this.questionsToAsk.set('second', {question: 'Does he stay at 21, Tapa street Ijesha Lagos?', answers: ['Yes', 'No', 'i am not sure', 'i think so']});
    this.questionsToAsk.set('third', {question: 'What is your relationship with him?', answers:['Brother', 'Sister', 'Father', 'Mother']});
    this.questionsToAsk.set('Fourth', {question: 'How long have you known him?', answers: ['1 year', '2 years', 'More than 2 years', 'I dont know him']});
    this.iterator = this.questionsToAsk.values();
    this.iteratorForKeys = this.questionsToAsk.keys();
    this.currentQuestion = this.iterator.next().value;
    this.stringIndexOfCurrentQuestion = this.iteratorForKeys.next().value;
    // console.log(this.currentQuestion);
  }


  
  selectAnswer(event: Event, question: string, answer: string[]){
    let div: HTMLDivElement;
    event.target instanceof HTMLDivElement ? div = event.target: div = (event.target as HTMLElement).parentElement as HTMLDivElement;
    const span: HTMLSpanElement = div.querySelector('span');
    const text = span.textContent.trim();
    document.querySelectorAll('.answerBoxes').forEach(elem => elem.classList.remove('selected'));
    div.classList.add('selected');
    const theanswer = answer.findIndex(ans => ans == text);
    if(theanswer != -1)
    this.answerFromUser.push({question: question, useranswer: text });
    this.collectedAnswer.set(this.stringIndexOfCurrentQuestion, this.answerFromUser);
    this.answerFromUser = [];
    (document.getElementById('nextButton') as HTMLButtonElement).disabled = false;

  }

  gotoNextQuestion(){
    try {
      (document.getElementById('nextButton') as HTMLButtonElement).disabled = true;
    document.querySelectorAll('.answerBoxes').forEach(elem => elem.classList.remove('selected'));
    this.stringIndexOfCurrentQuestion = this.iteratorForKeys.next().value;
    if(!this.stringIndexOfCurrentQuestion) throw 'Questions is done';
    this.currentQuestion = this.iterator.next().value;
    
    } catch (error) {
      this.view = 'done';
      // console.log(this.collectedAnswer);
    }
  }
}
