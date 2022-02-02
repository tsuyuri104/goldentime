import { TestBed } from '@angular/core/testing';

import { GroupNameService } from './group-name.service';

describe('GroupNameService', () => {
  let service: GroupNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
