import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from "@ngrx/store";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { GeneralService } from 'src/app/services/generalService/general.service';
import { AChild, SchoolClass } from 'src/app/models/data-models';
import { pluck } from 'rxjs/operators';
import { replyGiversOrReceivers } from 'src/app/models/GiverResponse';

type views = "" | 'edit-profile-info' | 'edit-picture';

@Component({
  selector: 'app-edit-child',
  templateUrl: './edit-child.component.html',
  styleUrls: ['./edit-child.component.css']
})
export class EditChildComponent implements OnInit {
  @ViewChild('inputTuition') inputTuition: ElementRef
  pictureOfChildInEdit: string | File;
  view: views = '';
  childInfoForm: FormGroup;
  destroy: Subscription[] = [];
  listOfChildrenParsed: Map<string, Partial<AChild>> = new Map();
  childTobeEdited: Partial<AChild>;
  listOfClassesInSchool: SchoolClass[]= []
 
  currentChildInEdit: string;
  constructor( private fb: FormBuilder, private store: Store, public generalservice: GeneralService) {

   }

  ngOnInit(): void {
     const str = sessionStorage.getItem('listOfChildren');
     this.listOfChildrenParsed = JSON.parse(str, this.reviver);
     this.listOfClassesInSchool  = JSON.parse(sessionStorage.getItem('school_classes'));

    this.destroy[2] = this.store
    .select(fromStore.getCurrentChildState)
    .pipe(pluck('child_info'))
    .subscribe((val: Map<string, Partial<AChild>>) => {
        if(val.size > 0){
          const keys = Array.from(val.keys());
          console.log(keys);
          keys.forEach(elem => {
            // console.log(Object.getOwnPropertyDescriptor(this.listOfChildrenParsed.get(elem), 'picture'));
              try {
                this.listOfChildrenParsed.get(elem).picture = val.get(elem).picture; 
              } catch (error) {
                console.log(error);
              } 
          })
        }

        // console.log(this.listOfChildrenParsed);
       
    });

    this.childInfoForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      class: ["", Validators.required],
      tuition_fees: ["", Validators.required]
    })
  }

  reviver(key, value) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }

  gotoNextPage(page: views, child){
    this.currentChildInEdit = child;
    const thischild = this.listOfChildrenParsed.get(this.currentChildInEdit);
    // console.log(thischild);
    this.view = page;
    this.childInfoForm.patchValue({
      first_name: thischild.first_name,
      last_name : thischild.last_name,
      class: thischild.class,
      tuition_fees: thischild.tuition_fees
    })

    this.pictureOfChildInEdit = thischild.picture;
    // console.log(this.pictureOfChildInEdit);

  }

  catchPictureEdited(event: File | string | ArrayBuffer){
    // console.log(event);
    // console.log(this.listOfChildrenParsed);
    this.handleParentEditedChildInfo(event)
  }

  handleParentEditedChildInfo(event: File | string | ArrayBuffer){
    this.listOfChildrenParsed.get(this.currentChildInEdit).picture = event as File;
    for(let elem in this.childInfoForm.value){
      this.listOfChildrenParsed.get(this.currentChildInEdit)[elem] = this.childInfoForm.value[elem];
    }

    this.listOfChildrenParsed.get(this.currentChildInEdit).full_name = `${this.listOfChildrenParsed.get(this.currentChildInEdit).first_name} ${this.listOfChildrenParsed.get(this.currentChildInEdit).last_name}`;
    
    const childEdited = this.listOfChildrenParsed.get(this.currentChildInEdit);
    this.store.dispatch(
      new generalActions.modifyIndividualChild({
        name: this.currentChildInEdit,
        dataToChange: childEdited
      })
    );

    this.view = '';
    setTimeout(() => {
      this.generalservice.successNotification('Child info has been edited successfully!')
    }, 1500);
  }


  userIsDoneEditing(){
    sessionStorage.removeItem('listOfChildren');
    sessionStorage.removeItem('editChild');
    this.generalservice.nextChatbotReplyToGiver = undefined;
    const responseFromParent = new replyGiversOrReceivers(
      `I have edited  ${
        this.listOfChildrenParsed.size == 1
          ? "my child's information"
          : "information about my children"
      }!`,
      "right"
    );


    this.generalservice.responseDisplayNotifier(responseFromParent);
    this.generalservice.handleFlowController("");
    setTimeout(() => {
      const responseFromBot = new replyGiversOrReceivers(
        `Thank you for editing your child's`,
        "left"
      );
       this.generalservice.nextChatbotReplyToGiver = new replyGiversOrReceivers(
        `Are you ready to be connected to a financial institution?`,
        "left",
        "Yes, No Later",
        `connectme, notinterested`,
        "allow"
      ); 
      this.generalservice.responseDisplayNotifier(responseFromBot);
    }, 1000);
  }

}
