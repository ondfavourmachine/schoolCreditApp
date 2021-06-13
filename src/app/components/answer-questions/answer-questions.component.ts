import { Component, OnInit } from '@angular/core';
import { AgentQuestions } from 'src/agentQuestions';
import { replyGiversOrReceivers } from 'src/app/models/GiverResponse';
import { ChatService } from 'src/app/services/ChatService/chat.service';
import { GeneralService } from 'src/app/services/generalService/general.service';

@Component({
  selector: 'app-answer-questions',
  templateUrl: './answer-questions.component.html',
  styleUrls: ['./answer-questions.component.css']
})
export class AnswerQuestionsComponent implements OnInit {
  questionsToAsk: string[] = [];
  page: '' | 'get-ready' | 'allQuestionsAnswered' = 'get-ready';
  questionsAnswered: Array<{question: string, answer: string}> = [];
  currentQuestion: string;
  setOfNumbers: Set<number> = new Set();
  currentIndex: number = 0;
  constructor(private generalservice: GeneralService, private  chat: ChatService) {
    
    while(this.setOfNumbers.size < 30){
      const randomNum = Math.floor(Math.random() * AgentQuestions.QuestionsForAgent.length);
      this.setOfNumbers.add(randomNum);
    }

    this.setOfNumbers.forEach(elem => {
      this.questionsToAsk.push(AgentQuestions.QuestionsForAgent[elem]);
    })

    this.currentQuestion = this.questionsToAsk[this.currentIndex];
    this.setOfNumbers = new Set();
   }

  ngOnInit(): void {
  }


  async selectAnswer(event: Event){
   try {
    const textContent = (event.target as HTMLParagraphElement).textContent;
    this.questionsAnswered.push({question: this.questionsToAsk[this.currentIndex], answer: textContent});
    this.currentIndex++;
    const width = (this.questionsAnswered.length / this.questionsToAsk.length) * 100;
    (document.querySelector('.indicator') as HTMLElement).style.width = `${width}%`;
    if(this.questionsToAsk[this.currentIndex]){
      const questionContainer = (document.querySelector('.questions_container') as HTMLElement);
     if(this.questionsToAsk[this.currentIndex].length > 65 && this.questionsToAsk[this.currentIndex].length < 100 ) {
      questionContainer.style.fontSize = '1.75rem';
      questionContainer.style.lineHeight = '2rem';
     }
     else if(this.questionsToAsk[this.currentIndex].length > 100){
        questionContainer.style.fontSize = '1.35rem';
      questionContainer.style.lineHeight = '2.0rem'; 
     }
     else{
      const q = (document.querySelector('.questions_container') as HTMLElement);
      q.style.fontSize = '2.05rem';
      q.style.lineHeight = '3rem';
    }
    }
   
    this.currentQuestion = this.questionsToAsk[this.currentIndex];
    if(!this.currentQuestion) throw new Error('The questions has finished!');
   } catch (error) {
      this.page = 'allQuestionsAnswered';

      const profile = JSON.parse(sessionStorage.getItem('agent_details'));
      console.log(profile);
      let formToSubmit = {};
      const keys = Object.keys(profile);
      keys.forEach((key) => {
        formToSubmit[key] = profile[key];
      })

     console.log(formToSubmit);
     formToSubmit['answers'] = [...this.questionsAnswered];
     console.log(formToSubmit);
     await this.chat.sendAnsweredQuestionsToServer(formToSubmit);
    }

    
  }


  closeQuestions(){
    this.generalservice.handleFlowController('');
    const responseFromParent = new replyGiversOrReceivers(
      `I have answered the questions`,
      "right"
    );
    this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
      `Thank you. Someone from creditclan will contact you.`,
      "left",
    );
    this.generalservice.responseDisplayNotifier(responseFromParent);
  }
}
