import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
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

    const newToken = uuidv4();
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

  getSessionObject<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  setSessionObject(key: string, data: object): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  removeSessionKey(key: string): void {
    sessionStorage.removeItem(key);
  }
}
