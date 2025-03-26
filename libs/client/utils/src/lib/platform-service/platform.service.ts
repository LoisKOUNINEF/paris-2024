import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private readonly _isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // ensures DOM Elements are defined (SSR)
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  get isBrowser(): boolean {
    return this._isBrowser;
  }
}
