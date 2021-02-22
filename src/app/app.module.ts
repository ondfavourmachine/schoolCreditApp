import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { registerLocaleData, TitleCasePipe } from "@angular/common";
import en from "@angular/common/locales/en";

// External Packages
import { StoreModule } from "@ngrx/store";
import { ToastrModule } from "ngx-toastr";
import { ImageCropperModule } from "ngx-image-cropper";

// components
import { TermsAndConditionComponent } from "./components/terms-and-condition/terms-and-condition.component";
import { GeneralFormsComponent } from "./components/general-forms/general-forms.component";

import { IdentifyOrAnonymousComponent } from "./components/forms/identify-or-anonymous/identify-or-anonymous.component";
import { SupportPageComponent } from "./components/forms/support-page/support-page.component";
import { FoundBeneficiaryComponent } from "./components/found-beneficiary/found-beneficiary.component";
import { EligibilityChecksComponent } from "./components/eligibility-checks/eligibility-checks.component";
import { BankDetailsComponent } from "./components/bank-details/bank-details.component";
import { FoodItemsComponent } from "./components/food-items/food-items.component";
import { TransparencyDisclaimerComponent } from "./components/transparency-disclaimer/transparency-disclaimer.component";
import { KnowYourReceiverComponent } from "./components/know-your-receiver/know-your-receiver.component";
import { PictureComponentComponent } from "./components/picture-component/picture-component.component";
import { ReceiverBankAccountComponent } from "./components/receiver-bank-account/receiver-bank-account.component";
import { SharedModule } from "./modules/shared/shared.module";
import { ConfirmDetailsUploadedComponent } from "./components/confirm-details-uploaded/confirm-details-uploaded.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { EvidenceUploadComponent } from "./components/evidence-upload/evidence-upload.component";
import { SelectionComponent } from "./components/selection/selection.component";
import { ChildInformationFormsComponent } from "./components/child-information-forms/child-information-forms.component";
import { ParentsInformationComponent } from "./components/parents-information/parents-information.component";
import { WorkFormComponent } from "./components/work-form/work-form.component";
import { PictureComponent } from "./components/picture/picture.component";
import { ProfileFormComponent } from "./components/profile-form/profile-form.component";
import { EditParentInfoComponent } from "./components/edit-parent-info/edit-parent-info.component";
import { BankPartnershipComponent } from "./components/bank-partnership/bank-partnership.component";
import { ContinuingExistingRequestsComponent } from "./components/continuing-existing-requests/continuing-existing-requests.component";
import { AddressFormComponent } from "./components/address-form/address-form.component";
import { ParentAccountFormComponent } from "./components/parent-account-form/parent-account-form.component";
import { MakeFullPaymentComponent } from "./components/make-full-payment/make-full-payment.component";
// import { StoreModule } from '@ngrx/store';

import { reducers } from "./store";
import { VerifyParentDataComponent } from './components/verify-parent-data/verify-parent-data.component';
// import { reducer } from "./store/reducers/parent.reducer";
import { SchoolBooksComponent } from "./components/school-books-display/school-books.component";
import { FilterPipe } from "./pipes/filter.pipe";

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    TermsAndConditionComponent,
    GeneralFormsComponent,
    IdentifyOrAnonymousComponent,
    SchoolBooksComponent,
    SupportPageComponent,
    FoundBeneficiaryComponent,
    EligibilityChecksComponent,
    BankDetailsComponent,
    FoodItemsComponent,
    TransparencyDisclaimerComponent,
    KnowYourReceiverComponent,
    PictureComponentComponent,
    ReceiverBankAccountComponent,
    ConfirmDetailsUploadedComponent,
    WelcomeComponent,
    EvidenceUploadComponent,
    SelectionComponent,
    ChildInformationFormsComponent,
    ParentsInformationComponent,
    WorkFormComponent,
    PictureComponent,
    ProfileFormComponent,
    EditParentInfoComponent,
    BankPartnershipComponent,
    ContinuingExistingRequestsComponent,
    AddressFormComponent,
    ParentAccountFormComponent,
    MakeFullPaymentComponent,
    FilterPipe,
    VerifyParentDataComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    ImageCropperModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: "toast-top-right",
      preventDuplicates: false
    }),
    StoreModule.forRoot({
      manageParent: reducers.parent_info,
      manageChild: reducers.children_info,
      manageCardTokenization: reducers.tokenize_process,
      schoolDetails: reducers.schoolDetails,
      manageLoanApplicationProcess: reducers.loanApplicationProcess
    })
  ],
  providers: [TitleCasePipe],
  bootstrap: [AppComponent]
})
export class AppModule {}
