import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureComponentComponent } from './picture-component.component';

describe('PictureComponentComponent', () => {
  let component: PictureComponentComponent;
  let fixture: ComponentFixture<PictureComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
