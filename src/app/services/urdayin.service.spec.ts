import { TestBed } from '@angular/core/testing';

import { UrdayinService } from './urdayin.service';

describe('UrdayinService', () => {
  let service: UrdayinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrdayinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
