import { TestBed } from '@angular/core/testing';

import { ReactionerService } from './reactioner.service';

describe('ReactionerService', () => {
  let service: ReactionerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReactionerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
