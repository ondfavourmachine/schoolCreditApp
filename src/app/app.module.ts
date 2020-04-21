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
// import { NgZorroAntdModule, NZ_I18N, en_US } from "ng-zorro-antd";

// components
import { TermsAndConditionComponent } from "./components/terms-and-condition/terms-and-condition.component";
import { GeneralFormsComponent } from "./components/general-forms/general-forms.component";
// import { BvnAndDOBFormComponent } from "./components/forms/bvn-and-dobform/bvn-and-dobform.component";

// import { LicenseValidationFormComponent } from "./components/forms/license-validation-form/license-validation-form.component";
// import { UploadPhotoAndStatementComponent } from "./components/forms/upload-photo-and-statement/upload-photo-and-statement.component";
import { QuestionsCtrlComponent } from "./components/Questions/questions-ctrl/questions-ctrl.component";
import { QuestionsTextComponent } from "./components/Questions/questions-text/questions-text.component";
import { QuestionOptionsComponent } from "./components/Questions/question-options/question-options.component";
import { QuestionsProgressBarComponent } from "./components/Questions/questions-progress-bar/questions-progress-bar.component";
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
import { ConfirmDetailsUploadedComponent } from './components/confirm-details-uploaded/confirm-details-uploaded.component';
import { WelcomeComponent } from './welcome/welcome.component';
// import { GiverComponentComponent } from './components/giver-component/giver-component.component';

// import { BBRWFormsComponent } from "./components/forms/bbrw-forms/bbrw-forms.component";

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    TermsAndConditionComponent,
    GeneralFormsComponent,
    IdentifyOrAnonymousComponent,
    // LoaderComponent,
    // BvnAndDOBFormComponent,
    // LicenseValidationFormComponent,
    // UploadPhotoAndStatementComponent,
    QuestionsCtrlComponent,
    QuestionsTextComponent,
    QuestionOptionsComponent,
    QuestionsProgressBarComponent,
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
    WelcomeComponent
    // GiverComponentComponent

    // BBRWFormsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    // { provide: NZ_I18N, useValue: en_US }
    TitleCasePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
