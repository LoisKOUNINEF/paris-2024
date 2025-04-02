import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { UserDto, User } from '@paris-2024/client-data-access-user';
import { LoginComponent } from './login.component';
import { LoginFormComponent } from '@paris-2024/client-ui-forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = {
      login: jest.fn().mockReturnValue(of({} as User)),
      isAdmin: jest.fn().mockReturnValue(false),
    };
    
    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [LoginFormComponent, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();  // Clean up after each test
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
    expect(routerMock.navigate).toHaveBeenCalledWith(['shop']);
  });

  it('should navigate to admin when user is admin', () => {
    authServiceMock.isAdmin.mockReturnValue(true);
    const userFormValue = { email: 'admin@test.com', password: 'password' };
    component.login(userFormValue);

    expect(routerMock.navigate).toHaveBeenCalledWith(['admin']);
  });

  it('should navigate to request-reset-link on goToResetPassword', () => {
    component.goToResetPassword();
    expect(routerMock.navigate).toHaveBeenCalledWith(['auth/request-reset-link']);
  });

  it('should navigate to signup on goToSignup', () => {
    component.goToSignup();
    expect(routerMock.navigate).toHaveBeenCalledWith(['auth/signup']);
  });
});
