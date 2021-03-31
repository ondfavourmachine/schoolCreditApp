import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Store } from "@ngrx/store";
import * as generalActions from "../../store/actions/general.action";
import * as fromStore from "../../store";
import { GeneralService } from 'src/app/services/generalService/general.service';
import { AChild, Parent, SchoolClass } from 'src/app/models/data-models';
import { pluck } from 'rxjs/operators';
import { replyGiversOrReceivers } from 'src/app/models/GiverResponse';
import { ChatService } from 'src/app/services/ChatService/chat.service';
import { ChildrenState } from 'src/app/store/reducers/children.reducer';

type views = "" | 'edit-profile-info' | 'edit-picture';

@Component({
  selector: 'app-edit-child',
  templateUrl: './edit-child.component.html',
  styleUrls: ['./edit-child.component.css']
})
export class EditChildComponent implements OnInit, OnDestroy {
  @ViewChild('inputTuition') inputTuition: ElementRef
  pictureOfChildInEdit: string | File;
  view: views = '';
  childInfoForm: FormGroup;
  destroy: Subscription[] = [];
  listOfChildrenParsed: Map<string, Partial<AChild>> = new Map();
  childTobeEdited: Partial<AChild>;
  listOfClassesInSchool: SchoolClass[]= [];
  parent: Parent;
  currentChildInEdit: string;
  tuitionFeesTotal: number;
  constructor( private fb: FormBuilder, 
    private store: Store, 
    public generalservice: GeneralService,
    private chatservice: ChatService) {

   }

  ngOnInit(): void {
     const str = sessionStorage.getItem('listOfChildren');
     this.listOfChildrenParsed = JSON.parse(str, this.reviver);
     this.listOfClassesInSchool  = JSON.parse(sessionStorage.getItem('school_classes'));

     this.destroy[0] = this.store
      .select(fromStore.getCurrentParentInfo)
      .subscribe(val => {
        this.parent = val as Parent;
        sessionStorage.setItem('guardian', this.parent.guardian);
      });

    this.destroy[1] = this.store
    .select(fromStore.getCurrentChildState)
    .pipe(pluck('child_info'))
    .subscribe((val: Map<string, Partial<AChild>>) => {
        if(val.size > 0){
          const keys = Array.from(val.keys());
          // console.log(keys);
          keys.forEach(elem => {
              let obj = {...val.get(elem)};
              // Object.assign()
              try {
                // this.listOfChildrenParsed.get(elem).picture = val.get(elem).picture; 
                // this.listOfChildrenParsed.get(elem).child_id = val.get(elem).child_id;
                let obj2 = Object.assign(this.listOfChildrenParsed.get(elem), obj);
                if(this.currentChildInEdit){
                  this.listOfChildrenParsed.set(this.currentChildInEdit, obj2);
                  console.log(obj2);
                  console.log(this.listOfChildrenParsed);
                }
              } catch (error) {
                console.log(error);
              } 
          })
        }

        // console.log(this.listOfChildrenParsed);
       
    });

    this.destroy[2] = this.store
      .select(fromStore.getCurrentChildState)
      .subscribe((val: any) => {
        const { total_tuition_fees } = val as ChildrenState;
        this.tuitionFeesTotal = total_tuition_fees;
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
    let obj = {...this.listOfChildrenParsed.get(this.currentChildInEdit)};
    obj.picture = event as File;
    Object.assign(this.listOfChildrenParsed.get(this.currentChildInEdit), {});
    for(let elem in this.childInfoForm.value){
      obj[elem] = this.childInfoForm.value[elem];
    }

    obj.full_name = `${obj.first_name} ${obj.last_name}`;
    let obj2 = Object.assign(this.listOfChildrenParsed.get(this.currentChildInEdit), obj);
    this.listOfChildrenParsed.set(this.currentChildInEdit, obj2);
    const childEdited = this.listOfChildrenParsed.get(this.currentChildInEdit);
    console.log(childEdited);
    
    // this.store.dispatch(
    //   new generalActions.modifyIndividualChild({
    //     name: this.currentChildInEdit,
    //     dataToChange: childEdited
    //   })
    // );

    this.view = '';
    setTimeout(() => {
      this.generalservice.successNotification('Child info has been edited successfully!')
    }, 500);
    this.submitEditedChildToServerAndStore();
  }

  async submitEditedChildToServerAndStore(){
    for (let [key, value] of this.listOfChildrenParsed) {
      try {
        await this.chatservice.modifyChildData(value.child_id, value);
      } catch (error) {
        console.log(error);
      }
      this.store.dispatch(new generalActions.updateAllSingleChildInfo({name: key, dataToChange: value}));
      this.store.dispatch(new generalActions.calculateFees());
    }


    let childArray = Array.from(this.listOfChildrenParsed.values());
    const arrayOfChildId: {id: any, amount: string}[] = childArray.map(element => {
      return{
        id: element.child_id || element.id,
        amount: element.tuition_fees
      }
    })
    const rf = sessionStorage.getItem('repaymentFrequency');
    try {
      await this.chatservice.sendLoanRequest({
        school_id: this.parent.school_id || 1,
        guardian_id: this.parent.guardian || sessionStorage.getItem('guardian'),
        loan_amount: this.tuitionFeesTotal.toString(),
        child_data: arrayOfChildId,
        repayment_frequency : rf == 'null' ? '3' : rf
      });
      await this.chatservice.fetchWidgetStages(this.tuitionFeesTotal.toString());
    } catch (error) {
        console.log(error)
    }
  }


  userIsDoneEditing(){
    // console.log(this.listOfChildrenParsed);

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

  ngOnDestroy(){
    this.destroy.forEach(elem => elem.unsubscribe())
  }

}
