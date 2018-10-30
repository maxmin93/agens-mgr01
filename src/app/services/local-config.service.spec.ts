import { TestBed, inject } from '@angular/core/testing';

import { LocalConfigService } from './local-config.service';

describe('LocalConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalConfigService]
    });
  });

  it('should be created', inject([LocalConfigService], (service: LocalConfigService) => {
    expect(service).toBeTruthy();
  }));
});
