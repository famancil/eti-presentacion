import { TestBed } from '@angular/core/testing';

import { ParametroService } from './parametro.service';

describe('ParametroService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ParametroService = TestBed.get(ParametroService);
    expect(service).toBeTruthy();
  });
});
