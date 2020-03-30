import { TestBed } from '@angular/core/testing';

import { GuiaRepasoService } from './guia-repaso.service';

describe('GuiaRepasoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GuiaRepasoService = TestBed.get(GuiaRepasoService);
    expect(service).toBeTruthy();
  });
});
