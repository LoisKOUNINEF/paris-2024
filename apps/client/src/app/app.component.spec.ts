import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, NavigationEnd, NavigationCancel } from '@angular/router';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { PlatformService } from '@paris-2024/client-utils';
import { BehaviorSubject, of } from 'rxjs';
import { Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'lib-navbar',
  template: ''
})
class MockNavbarComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let platformService: jest.Mocked<PlatformService>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let routerEvents: BehaviorSubject<any>;

  beforeEach(async () => {
    routerEvents = new BehaviorSubject<any>(null);

    platformService = {
      isBrowser: jest.fn().mockReturnValue(true)
    } as unknown as jest.Mocked<PlatformService>;

    authService = {
      checkUserStatus: jest.fn().mockReturnValue(of(null)),
    } as unknown as jest.Mocked<AuthService>;

    router = {
      events: routerEvents.asObservable(),
      url: '/test-url'
    } as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      declarations: [MockNavbarComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: PlatformService, useValue: platformService },
        { provide: AuthService, useValue: authService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    window.scrollTo = jest.fn();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have title "Paris 2024"', () => {
    expect(component.title).toBe('Paris 2024');
  });

  describe('ngOnInit', () => {
    it('should check user status if platform is browser', () => {
      component.ngOnInit();
      expect(authService.checkUserStatus).toHaveBeenCalled();
    });

    it('should not check user status if platform is not browser', () => {
      Object.defineProperty(platformService, 'isBrowser', {
        get: () => false
      });
      component.ngOnInit();
      expect(authService.checkUserStatus).not.toHaveBeenCalled();
    });
  });

  describe('recallJsFuntions', () => {
    it('should update location on NavigationEnd', fakeAsync(() => {
      component.recallJsFuntions();
      routerEvents.next(new NavigationEnd(1, '/test-url', '/test-url'));
      tick();
      expect(component.location).toBe('/test-url');
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    }));

    it('should update location but not scroll on NavigationCancel', fakeAsync(() => {
      component.recallJsFuntions();
      routerEvents.next(new NavigationCancel(1, '/test-url', ''));
      tick();
      expect(component.location).toBe('/test-url');
      expect(window.scrollTo).not.toHaveBeenCalled();
    }));
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from router events', () => {
      for (const subscription of component.subscriptions){
        const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
      }
    });
  });
});
