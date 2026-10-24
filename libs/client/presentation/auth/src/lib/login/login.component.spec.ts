import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
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

  const userFormValue = { email: 'test@test.com', password: 'Password123#' };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockReturnValue(of({} as User)),
      isAdmin: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<AuthService>;

    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

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
