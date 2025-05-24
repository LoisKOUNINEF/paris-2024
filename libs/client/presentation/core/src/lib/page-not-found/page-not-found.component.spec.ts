import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found.component';
import { PlatformService } from '@paris-2024/client-utils';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { BehaviorSubject } from 'rxjs';

describe('PageNotFoundComponent', () => {
  const routerEvents = new BehaviorSubject<any>(null);
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let router: Router;

  const routerMock = {
    navigate: jest.fn(),
    events: routerEvents.asObservable(),
  };

  const platformServiceMock = {
    isBrowser: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNotFoundComponent, RouteButtonComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: PlatformService, useValue: platformServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks();
    component.clearInterval();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize time with 5', () => {
    expect(component.time).toBe(5);
  });

  describe('ngOnInit', () => {
    it('should start countdown when platform is browser', () => {
      const spy = jest.spyOn(component as any, 'countdownToRedirect');
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });

    it('should not start countdown when platform is not browser', () => {
      platformServiceMock.isBrowser = false;
      const spy = jest.spyOn(component as any, 'countdownToRedirect');
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
      platformServiceMock.isBrowser = true; 
    });
  });

  describe('redirectToHome', () => {
    it('should navigate to home', () => {
      component.redirectToHome();
      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });

  describe('clearInterval', () => {
    it('should clear the interval and set intervalId to null', () => {
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      component['intervalId'] = 123;
      component.clearInterval();
      expect(clearIntervalSpy).toHaveBeenCalledWith(123);
      expect(component['intervalId']).toBeNull();
    });
  });

  describe('countdownToRedirect', () => {
    it('should set up interval that calls decreaseCountdown', fakeAsync(() => {
      const spy = jest.spyOn(component as any, 'decreaseCountdown');
      component['countdownToRedirect']();
      tick(1000);
      expect(spy).toHaveBeenCalled();
      component.clearInterval();
    }));
  });

  describe('decreaseCountdown', () => {
    it('should decrease countdown and time', () => {
      component.time = 5;
      component['decreaseCountdown']();
      expect(component.time).toBe(4);
      expect(component['time']).toBe(4);
    });

    it('should redirect to home when time reaches 0', () => {
      component.time = 1;
      const redirectSpy = jest.spyOn(component, 'redirectToHome');
      component['decreaseCountdown']();
      expect(redirectSpy).toHaveBeenCalled();
    });
  });

  describe('template integration', () => {
    it('should display countdown in template', () => {
      fixture.detectChanges();
      const countdownElement = fixture.nativeElement.querySelector('.countdown');
      expect(countdownElement.textContent).toContain('5');
    });

    it('should clear interval when component is destroyed', () => {
      const clearIntervalSpy = jest.spyOn(component, 'clearInterval');
      component.ngOnDestroy();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});