import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/generalService/general.service';

@Component({
  selector: 'app-agent-profile',
  templateUrl: './agent-profile.component.html',
  styleUrls: ['./agent-profile.component.css']
})
export class AgentProfileComponent implements OnInit {
  agentProfileForm: FormGroup;
  
  constructor(
    public generalservice: GeneralService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.agentProfileForm = this.fb.group({
      phone: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
    })
  }


  


  submitAgentProfile(form: FormGroup){
    sessionStorage.setItem('agent_details', JSON.stringify(form.value));
    this.generalservice.handleFlowController('');
    setTimeout(() => {
      this.generalservice.handleFlowController('answer-questions');
    }, 0);
  }

}
