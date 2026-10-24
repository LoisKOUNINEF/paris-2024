import { TestBed } from '@angular/core/testing';
import { GuestTokenService } from './guest-token.service';
import { PlatformService } from '../platform-service/platform.service';

describe('GuestTokenService', () => {
  let service: GuestTokenService;
  let platformService: { isBrowser: boolean };
  const GUEST_TOKEN_KEY = 'guest_token';

  beforeEach(() => {
    platformService = { isBrowser: true };
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        GuestTokenService,
        { provide: PlatformService, useValue: platformService },
      ],
    });
    service = TestBed.inject(GuestTokenService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getOrCreateGuestToken', () => {
    it('should create and store a new token when none exists', () => {
      Object.defineProperty(globalThis.crypto, 'randomUUID', {
        value: jest.fn().mockReturnValue('new-uuid'),
        configurable: true,
      });

      expect(service.getOrCreateGuestToken()).toBe('new-uuid');
      expect(sessionStorage.getItem(GUEST_TOKEN_KEY)).toBe('new-uuid');
    });

    it('should reuse the existing token', () => {
      sessionStorage.setItem(GUEST_TOKEN_KEY, 'existing-token');

      expect(service.getOrCreateGuestToken()).toBe('existing-token');
    });

    it('should return an empty string on the server', () => {
      platformService.isBrowser = false;
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

      expect(service.getOrCreateGuestToken()).toBe('');
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('getGuestToken', () => {
    it('should return the stored token', () => {
      sessionStorage.setItem(GUEST_TOKEN_KEY, 'existing-token');

      expect(service.getGuestToken()).toBe('existing-token');
    });

    it('should return null when no token is stored', () => {
      expect(service.getGuestToken()).toBeNull();
    });

    it('should return an empty string on the server', () => {
      platformService.isBrowser = false;
      sessionStorage.setItem(GUEST_TOKEN_KEY, 'existing-token');

      expect(service.getGuestToken()).toBe('');
    });
  });

  describe('clearGuestToken', () => {
    it('should remove the stored token', () => {
      sessionStorage.setItem(GUEST_TOKEN_KEY, 'existing-token');

      service.clearGuestToken();

      expect(sessionStorage.getItem(GUEST_TOKEN_KEY)).toBeNull();
    });

    it('should not touch storage on the server', () => {
      platformService.isBrowser = false;
      sessionStorage.setItem(GUEST_TOKEN_KEY, 'existing-token');

      service.clearGuestToken();

      expect(sessionStorage.getItem(GUEST_TOKEN_KEY)).toBe('existing-token');
    });
  });
});
