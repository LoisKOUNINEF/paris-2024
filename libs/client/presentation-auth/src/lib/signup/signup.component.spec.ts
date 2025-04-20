import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { UserDto, User } from '@paris-2024/client-data-access-user';
import { SignupComponent } from './signup.component';
import { FullUserFormComponent } from '@paris-2024/client-ui-forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from '@paris-2024/client-utils';


describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceMock: any;
  let routerMock: any;
  let snackbarMock: jest.Mocked<MatSnackBar>;
  let snackbarServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      signup: jest.fn().mockReturnValue(of({} as User)),
      login: jest.fn().mockReturnValue(of(true)),
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
      imports: [FullUserFormComponent, SignupComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
        { provide: MatSnackBar, useValue: snackbarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
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

  it('should call authService signup and navigate to shop after login', () => {
    const userFormValue = { email: 'test@test.com', password: 'password' };
    component.signup(userFormValue);

    expect(authServiceMock.signup).toHaveBeenCalledWith(new UserDto(userFormValue));
    snackbarServiceMock.showSuccess('done')
      .afterDismissed()
      .subscribe(() => {
        expect(authServiceMock.login).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['shop']);
    })
  });

  it('should navigate to login on goToLogin', () => {
    component.goToLogin();
    expect(routerMock.navigate).toHaveBeenCalledWith(['auth/login']);
  });
});
