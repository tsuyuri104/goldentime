import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullscreenDefaultComponent } from './fullscreen-default.component';

describe('FullscreenDefaultComponent', () => {
  let component: FullscreenDefaultComponent;
  let fixture: ComponentFixture<FullscreenDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullscreenDefaultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullscreenDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
