import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, NavigationEnd, NavigationCancel, Event } from '@angular/router';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { PlatformService } from '@paris-2024/client-utils';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let platformService: { isBrowser: boolean };
  let authService: jest.Mocked<AuthService>;
  let routerEvents: Subject<Event>;
  let userStatus$: Subject<unknown>;

  beforeEach(async () => {
    routerEvents = new Subject<Event>();
    userStatus$ = new Subject<unknown>();
    platformService = { isBrowser: true };

    authService = {
      checkUserStatus: jest.fn().mockReturnValue(userStatus$.asObservable()),
    } as unknown as jest.Mocked<AuthService>;

    const router = {
      events: routerEvents.asObservable(),
      url: '/test-url'
    } as unknown as Router;

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: PlatformService, useValue: platformService },
        { provide: AuthService, useValue: authService }
      ]
    })
    .overrideComponent(AppComponent, { set: { imports: [], template: '' } })
    .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    window.scrollTo = jest.fn();
  });

  it('should create with loading state', () => {
    expect(component).toBeTruthy();
    expect(component.title).toBe('Paris 2024');
    expect(component.loading).toBe(true);
  });

  describe('ngOnInit', () => {
    it('should check user status in the browser and stop loading on complete', () => {
      component.ngOnInit();
      expect(authService.checkUserStatus).toHaveBeenCalled();
      expect(component.loading).toBe(true);

      userStatus$.next({ isAuth: true, isStaff: false, isAdmin: false });
      userStatus$.complete();

      expect(component.loading).toBe(false);
    });

    it('should not check user status on the server', () => {
      platformService.isBrowser = false;
      component.ngOnInit();
      expect(authService.checkUserStatus).not.toHaveBeenCalled();
    });
  });

  describe('recallJsFuntions', () => {
    it('should update location and scroll to top on NavigationEnd', () => {
      component.recallJsFuntions();
      routerEvents.next(new NavigationEnd(1, '/test-url', '/test-url'));
      expect(component.location).toBe('/test-url');
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should update location but not scroll on NavigationCancel', () => {
      component.recallJsFuntions();
      routerEvents.next(new NavigationCancel(1, '/test-url', ''));
      expect(component.location).toBe('/test-url');
      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', () => {
      component.ngOnInit();
      component.recallJsFuntions();
      expect(component.subscriptions.length).toBe(2);

      component.ngOnDestroy();

      expect(component.subscriptions.every(s => s.closed)).toBe(true);
      expect(userStatus$.observed).toBe(false);
    });
  });
});
