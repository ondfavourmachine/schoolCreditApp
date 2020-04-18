import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransparencyDisclaimerComponent } from './transparency-disclaimer.component';

describe('TransparencyDisclaimerComponent', () => {
  let component: TransparencyDisclaimerComponent;
  let fixture: ComponentFixture<TransparencyDisclaimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransparencyDisclaimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransparencyDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
