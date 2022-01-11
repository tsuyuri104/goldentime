import { TestBed } from '@angular/core/testing';

import { MonthlyService } from './monthly.service';

describe('MonthlyService', () => {
  let service: MonthlyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
