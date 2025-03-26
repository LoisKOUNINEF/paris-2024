import { PLATFORM_ID } from '@angular/core';
import { PlatformService } from './platform.service';
import { TestBed } from '@angular/core/testing';

describe('PlatformService', () => {
  let service: PlatformService;

  describe('Browser Environment', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          PlatformService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(PlatformService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should detect browser platform', () => {
      expect(service.isBrowser).toBeTruthy();
    });

    it('should have isBrowser as a read-only property', () => {
      expect(() => {
        (service as any).isBrowser = false;
      }).toThrow();
    });
  });

  describe('Server Environment', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          PlatformService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      service = TestBed.inject(PlatformService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should detect server platform', () => {
      expect(service.isBrowser).toBeFalsy();
    });
  });
});