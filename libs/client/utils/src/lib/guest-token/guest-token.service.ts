import { Injectable } from '@angular/core';
import { PlatformService } from '../platform-service/platform.service';

const GUEST_TOKEN_KEY = 'guest_token';

@Injectable({
  providedIn: 'root',
})
export class GuestTokenService {
  constructor(private platformService: PlatformService) {}

  getOrCreateGuestToken(): string {
    if(!this.platformService.isBrowser) {
      return '';
    }
    const existingToken = sessionStorage.getItem(GUEST_TOKEN_KEY);
    if (existingToken) return existingToken;

    const newToken = crypto.randomUUID();
    sessionStorage.setItem(GUEST_TOKEN_KEY, newToken);
    return newToken;
  }

  getGuestToken(): string | null {
    if(!this.platformService.isBrowser) {
      return '';
    }
    return sessionStorage.getItem(GUEST_TOKEN_KEY);
  }

  clearGuestToken(): void {
    if(!this.platformService.isBrowser) {
      return;
    }
    sessionStorage.removeItem(GUEST_TOKEN_KEY);
  }
}
