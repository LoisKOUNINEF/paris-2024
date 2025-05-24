import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { SnackbarService } from '@paris-2024/client-utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDto, User } from '@paris-2024/client-data-access-user';
import { LoginComponent } from './login.component';
import { LoginFormComponent } from '@paris-2024/client-ui-forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let routerMock: any;
  let snackbarMock: jest.Mocked<MatSnackBar>;
  let snackbarServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      login: jest.fn().mockReturnValue(of({} as User)),
      isAdmin: jest.fn().mockReturnValue(false),
    };
    
    routerMock = {
      navigate: jest.fn(),
    };

    snackbarServiceMock = {
      showSuccess: jest.fn(() => ({
        afterDismissed: () => of({ dismissedByAction: false })
      })),
    };

    snackbarMock = {
      open: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      imports: [LoginFormComponent, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
        { provide: MatSnackBar, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe from subscription on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should call authService login and navigate to shop for non-admin', () => {
    const userFormValue = { email: 'test@test.com', password: 'password' };
    component.login(userFormValue);

    expect(authServiceMock.login).toHaveBeenCalledWith(new UserDto(userFormValue));
    snackbarServiceMock.showSuccess('done')
      .afterDismissed()
      .subscribe(() => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['shop']);
    })
  });

  it('should navigate to admin when user is admin', () => {
    authServiceMock.isAdmin.mockReturnValue(true);
    const userFormValue = { email: 'admin@test.com', password: 'password' };
    component.login(userFormValue);

    snackbarServiceMock.showSuccess('done')
      .afterDismissed()
      .subscribe(() => {
        expect(routerMock.navigate).toHaveBeenCalledWith(['admin']);
    })
  });

  it('should navigate to request-reset-link on goToResetPassword', () => {
    component.goToResetPassword();
    expect(routerMock.navigate).toHaveBeenCalledWith(['password-reset/request-reset-link']);
  });

  it('should navigate to signup on goToSignup', () => {
    component.goToSignup();
    expect(routerMock.navigate).toHaveBeenCalledWith(['auth/signup']);
  });
});
