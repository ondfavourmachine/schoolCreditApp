import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  OnDestroy
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from "@angular/forms";
import { GeneralService } from "src/app/services/generalService/general.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-general-forms",
  templateUrl: "./general-forms.component.html",
  styleUrls: ["./general-forms.component.css"]
})
export class GeneralFormsComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild("formsEntryPoint") formsEntryPoint: ElementRef;
  destroyFormControl: Subscription;
  // bvnAndDObForm: FormGroup;
  // bioAndNOKForm: FormGroup;
  public whatFormToShow: string;
  public formInBBRWToDisplay: string;
  public whereToStartFrom: string;
  constructor(
    private fb: FormBuilder,
    private generalservice: GeneralService
  ) {}

  ngOnInit() {
    this.destroyFormControl = this.generalservice.formControl$.subscribe(
      val => {
        this.whatFormToShow = String(val).trim();
        console.log(this.whatFormToShow);
      }
    );
  }

  ngAfterViewInit() {
    // console.log(this.formsEntryPoint.nativeElement);
  }

  ngOnChanges() {}

  controlWhichFormToShow() {}

  ngOnDestroy() {
    this.destroyFormControl.unsubscribe();
  }
}
