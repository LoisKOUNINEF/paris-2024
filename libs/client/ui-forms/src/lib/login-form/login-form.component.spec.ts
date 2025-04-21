import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LoginFormComponent } from './login-form.component';
import { By } from '@angular/platform-browser';
import { EmailFormComponent, PasswordFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        EmailFormComponent,
        PasswordFormComponent,
        SubmitButtonComponent,
      ],
      providers: [
        FormBuilder,
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should emit submitted event on form submission', () => {
    jest.spyOn(component.submitted, 'emit');
    const loginFormValue = {
      email: { email: 'test@example.com' },
      password: { password: 'Password123#' },
    };
    component.loginForm.patchValue(loginFormValue);
    component.onSubmit();
    expect(component.submitted.emit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123#',
    });
  });

  it('should parse user form correctly', () => {
    const loginFormValue = {
      email: { email: 'test@example.com' },
      password: { password: 'Password123#' },
    };
    component.loginForm.patchValue(loginFormValue);
    const result = component['parseUserForm']();
    expect(result).toEqual({
      email: 'test@example.com',
      password: 'Password123#',
    });
  });

  it('should disable submit button when form is invalid', () => {
    component.loginForm.setErrors({ incorrect: true });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('lib-submit-button');
    expect(submitButton.getAttribute('ng-reflect-is-disabled')).toBe('true');
  });

  it('should enable submit button when form is valid', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const validFormValue = {
      email: { email: 'valid@example.com' },
      password: { password: 'ValidPass123#' },
    };
    
    component.loginForm.patchValue(validFormValue);

    Object.values(component.loginForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    });

    component.loginForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
    tick();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.directive(SubmitButtonComponent)).componentInstance;

    expect(submitButton.isDisabled).toBe(false);
  }));
});
