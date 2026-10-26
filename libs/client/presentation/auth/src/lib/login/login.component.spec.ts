import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { GuestTokenService, SnackbarService } from '@paris-2024/client-utils';
import { UserDto, User } from '@paris-2024/client-data-access-user';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let guestTokenService: jest.Mocked<GuestTokenService>;
  let route: { snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> } };

  const userFormValue = { email: 'test@test.com', password: 'Password123#' };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockReturnValue(of({} as User)),
      isAdmin: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<AuthService>;

    router = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    route = { snapshot: { queryParamMap: convertToParamMap({}) } };

    snackbarService = {
      showSuccess: jest.fn().mockReturnValue({ afterDismissed: () => of(undefined) }),
    } as unknown as jest.Mocked<SnackbarService>;

    guestTokenService = {
      clearGuestToken: jest.fn(),
    } as unknown as jest.Mocked<GuestTokenService>;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: SnackbarService, useValue: snackbarService },
        { provide: GuestTokenService, useValue: guestTokenService },
      ],
    })
    .overrideComponent(LoginComponent, { set: { imports: [], template: '' } })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('login', () => {
    it('should log in, clear the guest token and go to the shop', () => {
      component.login(userFormValue);

      expect(authService.login).toHaveBeenCalledWith(new UserDto(userFormValue));
      expect(guestTokenService.clearGuestToken).toHaveBeenCalled();
      expect(snackbarService.showSuccess).toHaveBeenCalledWith('Vous êtes connecté.');
      expect(router.navigate).toHaveBeenCalledWith(['shop']);
    });

    it('should send admins to the admin area', () => {
      authService.isAdmin.mockReturnValue(true);

      component.login(userFormValue);

      expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should go back to the returnUrl set by a guard', () => {
      authService.isAdmin.mockReturnValue(true);
      route.snapshot.queryParamMap = convertToParamMap({ returnUrl: '/shop/checkout' });

      component.login(userFormValue);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/shop/checkout');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should ignore a returnUrl pointing outside the app', () => {
      route.snapshot.queryParamMap = convertToParamMap({ returnUrl: '//evil.com' });

      component.login(userFormValue);

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['shop']);
    });

    it('should stay on the page when the login fails', () => {
      // AuthService.login filters out failed (null) responses
      authService.login.mockReturnValue(EMPTY);

      component.login(userFormValue);

      expect(guestTokenService.clearGuestToken).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  it('should unsubscribe on destroy', () => {
    component.login(userFormValue);
    const unsubscribeSpy = jest.spyOn(component.subscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should navigate to request-reset-link on goToResetPassword', () => {
    component.goToResetPassword();
    expect(router.navigate).toHaveBeenCalledWith(['password-reset/request-reset-link']);
  });

  it('should navigate to signup on goToSignup', () => {
    component.goToSignup();
    expect(router.navigate).toHaveBeenCalledWith(['auth/signup']);
  });
});
