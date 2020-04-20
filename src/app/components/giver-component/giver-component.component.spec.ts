import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GiverComponentComponent } from './giver-component.component';

describe('GiverComponentComponent', () => {
  let component: GiverComponentComponent;
  let fixture: ComponentFixture<GiverComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GiverComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GiverComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
