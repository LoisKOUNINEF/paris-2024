import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PasswordConfirmFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { PasswordResetService } from '@paris-2024/client-data-access-password-reset';
import { ResetPasswordComponent } from './reset-password.component';
import { By } from '@angular/platform-browser';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let passwordResetServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  beforeEach(() => {
    passwordResetServiceMock = {
      resetPwd: jest.fn().mockReturnValue(of({ id: 1 })),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    activatedRouteMock = {
      snapshot: {
        params: { token: 'test-token' },
      },
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, PasswordConfirmFormComponent, SubmitButtonComponent, ResetPasswordComponent],
      providers: [
        { provide: PasswordResetService, useValue: passwordResetServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the resetPasswordForm', () => {
    component.ngOnInit();
    expect(component.resetPasswordForm).toBeTruthy();
    expect(component.resetPasswordForm.get('passwordConfirm')).toBeTruthy();
  });

  it('should unsubscribe from subscription on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should navigate to the login page after a successful password reset', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const validFormValue = {
      passwordConfirm: { 
        password: 'newPassword1#', 
        passwordConfirm: 'newPassword1#' 
      },
    };
    
    component.resetPasswordForm.patchValue(validFormValue);

    Object.values(component.resetPasswordForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    });

    component.resetPasswordForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
    tick();
    fixture.detectChanges();

    component.resetPassword();

    expect(passwordResetServiceMock.resetPwd).toHaveBeenCalledWith(
      { password: 'newPassword1#' },
      'test-token'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['auth/login']);
  }));

  it('should disable submit button when form is invalid', () => {
    component.ngOnInit();

    component.resetPasswordForm = component['formBuilder'].group({
      passwordConfirm: component['formBuilder'].group({}, Validators.required),
    });
    component.resetPasswordForm.markAsTouched();
    component.resetPasswordForm.setErrors({ 'incorrect': true });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('lib-submit-button');
    expect(submitButton.getAttribute('ng-reflect-is-disabled')).toBe('true');
  });

  it('should enable submit button when form is valid', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const validFormValue = {
      passwordConfirm: { 
        password: 'newPassword1#', 
        passwordConfirm: 'newPassword1#' 
      },
    };
    
    component.resetPasswordForm.patchValue(validFormValue);

    Object.values(component.resetPasswordForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    });

    component.resetPasswordForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
    tick();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.directive(SubmitButtonComponent)).componentInstance;
    expect(submitButton.isDisabled).toBe(false);
  }));
});