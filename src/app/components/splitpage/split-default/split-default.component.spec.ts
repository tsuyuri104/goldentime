import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitDefaultComponent } from './split-default.component';

describe('SplitDefaultComponent', () => {
  let component: SplitDefaultComponent;
  let fixture: ComponentFixture<SplitDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitDefaultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
