import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDifferComponent } from './report-differ.component';

describe('ReportDifferComponent', () => {
  let component: ReportDifferComponent;
  let fixture: ComponentFixture<ReportDifferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportDifferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDifferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
