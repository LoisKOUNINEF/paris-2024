import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PasswordResetService } from '@paris-2024/client-data-access-password-reset';
import { UserDto } from '@paris-2024/client-data-access-user';
import { RequestPasswordResetLinkComponent } from './request-password-reset-link.component';
import { EmailFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { By } from '@angular/platform-browser';

describe('RequestPasswordResetLinkComponent', () => {
  let component: RequestPasswordResetLinkComponent;
  let fixture: ComponentFixture<RequestPasswordResetLinkComponent>;
  let passwordResetServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    passwordResetServiceMock = {
      sendPwdResetLink: jest.fn().mockReturnValue(of(true)),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EmailFormComponent, SubmitButtonComponent, RequestPasswordResetLinkComponent],
      providers: [
        { provide: PasswordResetService, useValue: passwordResetServiceMock },
        { provide: Router, useValue: routerMock },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestPasswordResetLinkComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on init', () => {
    component.ngOnInit();
    expect(component.requestResetLinkForm).toBeTruthy();
    expect(component.requestResetLinkForm.controls['email']).toBeTruthy();
  });

  it('should unsubscribe from subscription on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should navigate to reset password if form is invalid', () => {
    component.requestResetLinkForm = component['formBuilder'].group({
      email: component['formBuilder'].group({}, Validators.required)
    });
    component.requestResetLinkForm.markAsTouched();
    component.requestResetLinkForm.setErrors({ 'incorrect': true });
    component.sendPwdResetLink();
    expect(routerMock.navigate).toHaveBeenCalledWith(['password-reset']);
  });

  it('should disable submit button when form is invalid', () => {
    component.requestResetLinkForm = component['formBuilder'].group({
      email: component['formBuilder'].group({}, Validators.required)
    });
    component.requestResetLinkForm.markAsTouched();
    component.requestResetLinkForm.setErrors({ 'incorrect': true });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('lib-submit-button');
    expect(submitButton.getAttribute('ng-reflect-is-disabled')).toBe('true');
  });

  it('should enable submit button when form is valid', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const validFormValue = {
      email: { email: 'valid@example.com' },
      userInfos: { firstName: 'Jane', lastName: 'Doe' }
    };
    
    component.requestResetLinkForm.patchValue(validFormValue);

    Object.values(component.requestResetLinkForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    });

    component.requestResetLinkForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
    tick();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.directive(SubmitButtonComponent)).componentInstance;

    expect(submitButton.isDisabled).toBe(false);
  }));

  it('should send password reset link and navigate to reset-link-sent', () => {
    component.requestResetLinkForm = component['formBuilder'].group({
      email: { email: 'test@test.com' },
    });
    component.sendPwdResetLink();

    expect(passwordResetServiceMock.sendPwdResetLink).toHaveBeenCalledWith(new UserDto({ email: 'test@test.com' }));
    expect(routerMock.navigate).toHaveBeenCalledWith(['password-reset/reset-link-sent']);
  });
});
