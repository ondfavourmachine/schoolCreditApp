import { Injectable, Inject } from "@angular/core";
// import * as AllAPI from "src/app/models/token";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, forkJoin } from "rxjs";
import { Reference } from "src/app/models/reference-type";
import {
  ParentRegistration,
  Parent,
  ParentRegistrationResponse,
  AChild,
  ParentAddressInfo,
  CompleteParentInfomation,
  Bank,
  ParentAccountInfo,
  ContinuingExistingRequestResponse,
  SchoolDetailsModel,
  SchoolBook,
  SchoolBookStructure,
  TeacherDetails
} from "src/app/models/data-models";
import { timeout } from "rxjs/operators";
// import { retry } from "rxjs/operators";
// import { LgaData } from "../../models/lgaData";

interface Questions {
  text: {
    id: string;
    question: string;
    answer_set: string;
    category_id: string;
    type: string;
  };
  finished: boolean;
  status: boolean;
}

type repaymentFrequency = "1" | "2" | "3" | string;

interface GenericResponse {
  message: string;
  status: boolean;
  parent?: Parent
}

interface ChildDataSavedResponse extends GenericResponse {
  child: string | number;
}

interface ParentAWBAResponse extends GenericResponse {
  data: CompleteParentInfomation;
}


export interface FinancialInstitution {
  lender_name: string;
  loan_amount: number;
  duration: number;
}

@Injectable({
  providedIn: "root"
})
export class ChatService {
  generalUrl = `https://sellbackend.creditclan.com/schoolcredit/public/index.php/api/`;
  creditClanApi: 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228';
  files: File;
  httpHeaders = new HttpHeaders({
    "x-api-key": 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228'
  });
  httpOptions: HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json"
  });

  constructor(private http: HttpClient) {
    // this.zeroAllSubmit().subscribe();
    // this.oneAllSubmit().subscribe();
  }

  // School credit api starts here

  // register Parent starts here

  registerParent(
    form: ParentRegistration
  ): Observable<ParentRegistrationResponse> {
    return this.http.post<ParentRegistrationResponse>(
      `${this.generalUrl}parent/register`,
      form
    );
  }

  dispatchOTP(obj: { phone: string }): Promise<any> {
    return this.http
      .post<any>(`${this.generalUrl}sms/send/otp`, obj)
      .toPromise();
  }

  uploadParentPicture(obj: { picture: File; guardian: string }): Promise<any> {
    let objToSubmit = new FormData();
    objToSubmit.append("picture", obj.picture);
    objToSubmit.append("guardian", obj.guardian);
    return this.http
      .post<any>(`${this.generalUrl}parent/picture`, objToSubmit)
      .toPromise();
  }

  verifyOTP(obj: {
    phone_OTP: string;
    guardian: string;
  }): Promise<GenericResponse> {
    return this.http
      .post<GenericResponse>(`${this.generalUrl}sms/verify/otp`, obj)
      .toPromise();
  }

  updateEmail(obj: {
    email: string;
    guardian: string;
  }): Promise<GenericResponse> {
    return this.http
      .patch<GenericResponse>(`${this.generalUrl}parent/email`, obj)
      .toPromise();
  }

  saveParentPIN(obj: {
    pin: string;
    guardian: string;
  }): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.generalUrl}pin`, obj);
  }
  // ends here

  // ask for children info starts here
  updateChildrenCount(obj: {
    guardian: string;
    children_count: number;
  }): Observable<GenericResponse> {
    return this.http.patch<GenericResponse>(`${this.generalUrl}child`, obj);
  }

  saveChildData(
    obj: Partial<AChild>,
    guardianID,
    schoolID
  ): Promise<ChildDataSavedResponse> {
    const formToSubmit = new FormData();
    for (let key in obj) {
      formToSubmit.append(key == "name" ? "full_name" : key, obj[key]);
    }
    formToSubmit.delete("index");
    formToSubmit.append("guardian", guardianID);
    formToSubmit.append("school_id", schoolID);

    return this.http
      .post<ChildDataSavedResponse>(`${this.generalUrl}child`, formToSubmit)
      .toPromise();
  }


  modifyChildData(childId, form: Partial<AChild>): Promise<ChildDataSavedResponse>{
    const formToSubmit = new FormData();
    delete form.first_name;
    delete form.last_name;
    for (let key in form) {
      formToSubmit.append(key == "name" ? "full_name" : key, form[key]);
    }
    return this.http.post<ChildDataSavedResponse>(`${this.generalUrl}child/${childId}`, formToSubmit).toPromise()
  }

  // ends here

  // check if Parent has PIN
  checkIfParentHasPreviouslySavedPIN(obj: {email: string}){
    return this.http.post<GenericResponse>(`${this.generalUrl}check/pin`, obj);
  }

  // save parent BVN
  saveParentBVN(
    obj: Partial<CompleteParentInfomation>
  ): Promise<ParentAWBAResponse> {
    return this.http
      .post<ParentAWBAResponse>(`${this.generalUrl}bvn`, obj)
      .toPromise();
  }

  // save parent ID information/verify it
  saveAndVerifyParentID(
    obj: Partial<CompleteParentInfomation>
  ): Observable<ParentAWBAResponse> {
    return this.http.post<ParentAWBAResponse>(
      `${this.generalUrl}identity`,
      obj
    );
  }

  // get financial institution
  getFinancialInstitution(): Observable<FinancialInstitution> {
    return this.http.get<FinancialInstitution>(`${this.generalUrl}lender/rate`);
  }

  // do a check if card has been added
  checkIfCardHasBeenAddedByParent(): Observable<any>{
    return this.http.get(`${this.generalUrl}card/57487`)
  }

  // get bank statement url for iframe
  getIframeSrcForBankstatement(request_id, account: {account_name: string, account_number: string, bank_id: any}){
    
    return this.http.post<{url: string, status: boolean, token: string, message: string}>
   (`https://mobile.creditclan.com/api/v3/bankstatement/initiate`, {request_id: request_id || "57487", has_online_banking : '1', account}, {headers: this.httpHeaders}).toPromise()
  }
  
  // iframe for card tokenisation
  getIframeSrcForCardTokenization(requestid): Promise<{url: string, status: boolean, token: string, message: string}>{
    
    return this.http.post<{url: string, status: boolean, token: string, message: string}>
    (`https://mobile.creditclan.com/api/v3/card/tokenization`, {request_id: requestid || "57487"}, {headers: this.httpHeaders}).toPromise()
  }

  // update Nebechi of Parent Widget stages
  updateBackEndOfSuccessfulCompletionOfWidgetStage(requestid: string, stage: string): Promise<GenericResponse>{
    return this.http.patch<GenericResponse>(`${this.generalUrl}loan/${requestid}/stage`, {stage}).toPromise()
  }

  // send the new Creditclan requestId to nebechi

  updateCreditClanRequestId(request_id: any, creditclanrequestid: any ): Promise<any>{
    return this.http.patch<any>(`${this.generalUrl}request/${request_id}`, {
      creditclan_request_id: creditclanrequestid
    }).toPromise();
  }

  // save parent work information

  saveParentWorkInformation(obj: {
    employer: string;
    role: string;
    guardian: any;
    annual_salary: any;
  }): Observable<ParentAWBAResponse> {
    return this.http.post<ParentAWBAResponse>(`${this.generalUrl}work`, obj);
  }
  
  // save parent address information
  saveParentAddressInformation(
    obj: Partial<Parent> & Partial<ParentAddressInfo>
  ): Observable<ParentAWBAResponse> {
    return this.http.post<ParentAWBAResponse>(`${this.generalUrl}address`, obj);
  }

  //  save parent card information
  saveParentAccountInformation(
    obj: Partial<CompleteParentInfomation>
  ): Observable<ParentAWBAResponse> {
    return this.http.post<ParentAWBAResponse>(`${this.generalUrl}bank`, obj);
  }

  // save parent credit card information

  saveParentCreditCardInformation(
    obj: Partial<CompleteParentInfomation>
  ): Observable<ParentAWBAResponse> {
    return this.http.post<ParentAWBAResponse>(`${this.generalUrl}card`, obj);
  }

  verifyParentEmailActivationCode(obj: {token: any, guardian: any}): Observable<GenericResponse>{
    return this.http.patch<GenericResponse>(`${this.generalUrl}email/verify`, obj);
  }

  // confirm parent Pin
  confirmParentPIN(obj: {
    PIN: string;
    [propName: string]: string;
  }): Observable<ContinuingExistingRequestResponse> {
    return this.http.post<ContinuingExistingRequestResponse>(
      `${this.generalUrl}continue/request`,
      obj
    );
  }

  // change contact or email
  changePhoneOrEmail(obj: {
    phone?: string;
    guardian: string;
    email?: string;
  }): Promise<GenericResponse> {
    return this.http
      .patch<GenericResponse>(`${this.generalUrl}change/identity`, obj)
      .toPromise();
  }

  submitParentWithoutPin(obj: {token:any,pin:any,confirm_pin: any, email: string}):Observable<{
    guardian: any, message: any, status: any}>{
        return this.http.patch<any>(`${this.generalUrl}email/verify`, obj)
  }

  // check if email is unique
  checkEmailUniqueness(email: {email: string}): Observable<GenericResponse>{
    return this.http.post<GenericResponse>(`${this.generalUrl}email/unique`, email);
  }

  checkPhoneUniqueness(phone: {phone: string, edit?:boolean, guardian?: boolean}): Observable<GenericResponse>{
    return this.http.post<GenericResponse>(`${this.generalUrl}phone/unique`, phone);
  }

  // send activation code to parent
  sendEmailOTP(obj: {email: string}, need: 'observable' | 'promise'): Observable<GenericResponse> | Promise<GenericResponse>{
    switch(need){
      case 'observable':
        return this.http
        .post<GenericResponse>(`${this.generalUrl}email/send/otp`, obj)
      case 'promise':
        return this.http
        .post<GenericResponse>(`${this.generalUrl}email/send/otp`, obj).toPromise()
    }
  }
  

  // getschoolDetails
  fetchSchoolDetails(nameOfSchool: string): Promise<{data: {school: SchoolDetailsModel}, message: string, status: boolean}>{
    // console.log(nameOfSchool);
    return this.http.get<any>(`${this.generalUrl}user/${nameOfSchool}`).toPromise();
  }

  // get school Books

  // register parent that wants to make full payment
  registerParentForFullPayment(obj: {guardian_id: any, payment_type: any}){
    return this.http.post(`${this.generalUrl}payment/type`, obj).toPromise()
  }

  getAllBooksFromSchool(schoolId, page_num = 1): 
    Observable<{
    code: number, data: SchoolBookStructure,  
    status: boolean, message: string
  }>{
    return this.http.get<any>(`${this.generalUrl}books?school=${schoolId}&page=${page_num}`)
  }

  // get offers
    getLoanOffers(request_id: any): Promise<any>{
      const url = "https://mobile.creditclan.com/api/v3/schoolportal/offers";
      
      return this.http.post(url, {request_id : request_id || "57487"}, {headers: this.httpHeaders}).toPromise()
    }

    updateBackEndWithBreakpoint(breakPoint: {breakpoint: any, creditclan_request_id: any}){
      return  this.http.patch(`${this.generalUrl}breakpoint`, breakPoint).toPromise();
    }

    updateBackEndWithOffer(offer: {request_id: any, offer: Record<string, any>}){
      return  this.http.patch(`${this.generalUrl}offer`, offer).toPromise();
    }

  // get Widget Stages for Parent
  fetchWidgetStages(amount="12000"): Promise<any> {
    return  this.http.post(`${this.generalUrl}offer/stages`, {amount}).toPromise();
  }
  
  // sendLoanRequest
  sendLoanRequest(obj: {school_id: any,  guardian_id: any, loan_amount: string,
        child_data: {id: string, tuition: string}[], repayment_frequency: repaymentFrequency,}): Promise<{message: string; request: number; status:boolean}>{
    return this.http.post<any>(`${this.generalUrl}loan/request`, obj).toPromise()
  }

  // fetch list of banks
  fetchBankNames(): Bank[] {
    let allBanks = JSON.parse(sessionStorage.getItem("allBanks"));
    if (sessionStorage.getItem("allBanks")) {
      return allBanks["data"] as Array<Bank>;
    }
    let url = "https://mobile.creditclan.com/webapi/v1/banks";
    
    this.http.get(url, { headers: this.httpHeaders }).subscribe(
      val => {
        // console.log(this.banks);
        sessionStorage.setItem("allBanks", JSON.stringify(val));
        return [...val["data"]];
      },
      err => console.log(err)
    );
  }
  
  // check if card exists

  checkIfParentHasSavedCardDetails(request_id, user_id): Promise<{status: boolean, data:{card: boolean}}>{
    return this.http.post<any>('https://mobile.creditclan.com/api/v3/loan/checklists', { request_id, user_id }, {
        headers: this.httpHeaders
      }).toPromise();
  }

  // confirm account details
  confirmAccountDetailsOfParent(obj: { bank_code: any; account_number: any }) {
    let url = "https://mobile.creditclan.com/webapi/v1/account/resolve";
   

    return this.http
      .post(url, obj, { headers: this.httpHeaders })
      .pipe(timeout(50000));
  }

  // sendBvnAndDOB(bvnAndDOB: {
  //   ref_no: string;
  //   BVN: string;
  //   sent_dob: string;
  // }): Observable<any> {
  //   return this.http.post(`${this.generalUrl}checkbvn`, bvnAndDOB, {
  //     headers: this.httpOptions
  //   });
  // }

  sendAndVerifyBvnAndDOB(bvnAndDOB: {
    phone: string;
    bvn: string;
    dob: string;
  }): Observable<GenericResponse> {
   
    return this.http.post<GenericResponse>(
      `https://mobile.creditclan.com/webapi/v1/verify_bvn_dob`,
      bvnAndDOB,
      {
        headers: this.httpHeaders
      }
    );
  }

  // gets the Ref Number provided by the user from the url or manually typed in
  fetchRefNumber(ref: { ref_no: string }) {
    return this.http.post(`${this.generalUrl}validateRefNo`, ref);
  }

  bioAndNOKForm(userData: Partial<Reference>): Observable<any> {
    return this.http.post(`${this.generalUrl}updateRefBioDataInfo`, userData, {
      headers: this.httpOptions
    });
  }

  residentialAddressForm(userData: Partial<Reference>): Observable<any> {
    return this.http.post(
      `${this.generalUrl}updateRefAddressDataInfo`,
      userData,
      {
        headers: this.httpOptions
      }
    );
  }

  // getLGA(stateID: string): Observable<any> {
  //   return this.http.get(`${this.retrieveLga}${stateID}`);
  // }
  workAndIncomeForm(userData: Partial<Reference>): Observable<any> {
    return this.http.post(
      `${this.generalUrl}updateRefWorkIncomeDataInfo`,
      userData,
      {
        headers: this.httpOptions
      }
    );
  }

  // this function fetches credibilty questions
  getCredibiltyQuestions(ref_no: string): Observable<any> {
    return this.http.post(
      `${this.generalUrl}questions`,
      { ref_no },
      { headers: this.httpOptions }
    );
  }

  // this function uploads image
  // dont add a content-type when uploading images or files
  uploadImage(obj): Observable<any> {
    return this.http.post(`${this.generalUrl}uploadImage`, obj);
  }

  // this function uploads the bankstatment
  uploadBankStatement(obj): Observable<any> {
    return this.http.post(`${this.generalUrl}uploadBankStatement`, obj);
  }

  // this function uploads the licence
  uploadLicenceValidation(obj: {
    ref_no: string;
    licence_number: string;
    sent_dob: string;
  }) {
    return this.http.post(`${this.generalUrl}checkDriversLicense`, obj, {
      headers: this.httpOptions
    });
  }

  // this function sends transactionID to Nebechi
  sendTransactionID(transID: string) {
    const ref_no = sessionStorage.getItem("ref_no");
  }

  sendIppisNo(obj): Observable<any> {
    return this.http.post(`${this.generalUrl}ippisdata`, obj);
  }

  zeroAllSubmit() {
    // const ref_no = sessionStorage.getItem("ref_no");
    return this.http.post(
      `https://crediblesbackend.creditclan.com/public/index.php/api/zeroallsubmit`,
      {
        ref_no: "O0ThHixm"
      }
    );
  }

  turnSelfieAndStatementToZero(): Observable<any> {
    const ref_no = sessionStorage.getItem("ref_no");
    return this.http.post(
      `http://lendertest.creditclan.com/public/turnSelfieStatementtoZero`,
      {
        ref_no
      }
    );
  }

  oneAllSubmit() {
    return this.http.post(
      `http://35.222.184.247/incredible/public/index.php/api/oneallsubmit`,
      {
        ref_no: "O0ThHixm"
      }
    );
  }

  tellBackEndThatGamePlayisOver() {
    const ref_no = sessionStorage.getItem("ref_no");
    this.http.post(`${this.generalUrl}finishedanswer`, { ref_no }).subscribe();
  }

  editGuardianDetails(form: FormData, guardianID: string){
    return this.http.post(`${this.generalUrl}guardian/${guardianID}/edit`, form).toPromise()
  }

  deleteGuardian(){
    return this.http.post(`${this.generalUrl}guardian`, {emails: [
    'ondfavourmachine+2@gmail.com', 
    'ondfavourmachine+12@gmail.com', 'ondfavourmachine+13@gmail.com', 'ondfavourmachine+100@gmail.com',
    'ondfavourmachine+35@gmail.com', 'ondfavourmachine+40@gmail.com',
    'ondfavourmachine+1000@gmail.com', 'ondfavourmachine+50@gmail.com',
    'ondfavourmachine+15@gmail.com', 'ondfavourmachine+16@gmail.com', 'ondfavourmachine+17@gmail.com',
    'ondfavourmachine+20@gmail.com', 'ondfavourmachine+18@gmail.com', 'ondfavourmachine+19@gmail.com',
    'ondfavourmachine+25@gmail.com', 'ondfavourmachine+3@gmail.com', 'ondfavourmachine+8@gmail.com',
    'ondfavourmachine@gmail.com', "ondfavourmachine+10@gmail.com", 'ondfavourmachine+5@gmail.com']}).toPromise();
  }


   fetchQuestions(id: any): Promise<{data: any, message: string, status: boolean}>{
     const url= `https://mobile.creditclan.com/api/v3/customer/get_frequently_asked_question_request`;
    
     return this.http.post<{data: any, message: string, status: boolean}>(url, {request_id: id}, {
      headers: this.httpHeaders
    }).toPromise()
   }


   submitQuestionAndAnswer(answers: Array<string>){
     const id = sessionStorage.getItem('request_id');
    const url = 'https://mobile.creditclan.com/api/v3/customer/submit_frequently_asked_question';
    
     return this.http.post<{data: any, message: string, status: boolean}>(url, {request_id: id, answers}, {
      headers: this.httpHeaders
    })
   }

   getTeachersNameAndOffers(teacher: string): Promise<{code: number, data: Partial<TeacherDetails>, message: string, status: boolean}>{
     return this.http.get<any>(`${this.generalUrl}teacher/${teacher}/offers`).toPromise();
   }

   getTeacherSummaryPage(obj: Object): Promise<any>{
     const url = 'https://mobile.creditclan.com/api/v3/school/teacher/summary';
      return this.http.post(url, obj, {headers: this.httpHeaders}).toPromise();
   }

   getCreditClanRequestIdForTeachers(obj: Object): Promise<any>{
    const url = 'https://mobile.creditclan.com/api/v3/school/teacher/request';
    return this.http.post(url, obj, {headers: this.httpHeaders}).toPromise();
   }

   sendTeacherAcceptedLoansToBackend(obj: {loan_amount, teacher_id, school_id}): Promise<any>{
     return this.http.post(`${this.generalUrl}teacher/loan`, obj).toPromise();
   }

   updateTeacherIDWithCreditclanId(creditclanid: string, loanRequestId: string){
     return this.http.patch(`${this.generalUrl}teacher/loan/${loanRequestId}`, {creditclan_request_id: creditclanid}).toPromise()
   }

   sendAnsweredQuestionsToServer(answers: Object): Promise<any>{
    return this.http.post(`https://sellbackend.creditclan.com/merchantclan/public/index.php/api/agent/profile`, answers).toPromise();
   }
  
}


