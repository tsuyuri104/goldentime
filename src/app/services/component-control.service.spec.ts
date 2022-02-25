import { TestBed } from '@angular/core/testing';

import { ComponentControlService } from './component-control.service';

describe('ComponentControlService', () => {
  let service: ComponentControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
