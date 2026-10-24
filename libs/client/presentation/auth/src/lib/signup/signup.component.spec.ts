import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { UserDto, User } from '@paris-2024/client-data-access-user';
import { GuestTokenService, SnackbarService } from '@paris-2024/client-utils';
import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let snackbarService: jest.Mocked<SnackbarService>;
  let guestTokenService: jest.Mocked<GuestTokenService>;

  const userFormValue = {
    email: 'test@test.com',
    password: 'Password123#',
    firstName: 'Loïs',
    lastName: 'Test',
  };

  beforeEach(async () => {
    authService = {
      signup: jest.fn().mockReturnValue(of({ id: '1' } as User)),
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
      imports: [SignupComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: SnackbarService, useValue: snackbarService },
        { provide: GuestTokenService, useValue: guestTokenService },
      ],
    })
    .overrideComponent(SignupComponent, { set: { imports: [], template: '' } })
    .compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
  });

  describe('signup', () => {
    it('should create the account and go to the pending verification page', () => {
      component.signup(userFormValue);

      expect(authService.signup).toHaveBeenCalledWith(new UserDto(userFormValue));
      expect(guestTokenService.clearGuestToken).toHaveBeenCalled();
      expect(snackbarService.showSuccess).toHaveBeenCalledWith('Compte créé.');
      expect(router.navigate).toHaveBeenCalledWith(['auth/pending-verification']);
    });

    it('should stay on the page when the signup fails', () => {
      authService.signup.mockReturnValue(of(null as unknown as User));

      component.signup(userFormValue);

      expect(guestTokenService.clearGuestToken).not.toHaveBeenCalled();
      expect(snackbarService.showSuccess).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  it('should unsubscribe on destroy', () => {
    component.signup(userFormValue);
    const unsubscribeSpy = jest.spyOn(component.subscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should navigate to login on goToLogin', () => {
    component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['auth/login']);
  });
});
