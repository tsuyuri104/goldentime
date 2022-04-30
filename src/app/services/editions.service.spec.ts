import { TestBed } from '@angular/core/testing';

import { EditionsService } from './editions.service';

describe('EditionsService', () => {
  let service: EditionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
