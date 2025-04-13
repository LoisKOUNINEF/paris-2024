import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordConfirmFormComponent } from './password-confirm-form.component';
import { ReactiveFormsModule, FormGroup, ControlContainer, AbstractControl } from '@angular/forms';
import { RevealPasswordPipe, PwdCheckboxTextPipe } from '@paris-2024/client-utils';
import { By } from '@angular/platform-browser';

class MockControlContainer {
  control: AbstractControl = new FormGroup({});
}

describe('PasswordConfirmFormComponent', () => {
  let component: PasswordConfirmFormComponent;
  let fixture: ComponentFixture<PasswordConfirmFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        PasswordConfirmFormComponent,
        RevealPasswordPipe,
        PwdCheckboxTextPipe
      ],
      providers: [{ provide: ControlContainer, useClass: MockControlContainer }]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordConfirmFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with password and passwordConfirm controls', () => {
    expect(component.passwordConfirmForm.contains('password')).toBeTruthy();
    expect(component.passwordConfirmForm.contains('passwordConfirm')).toBeTruthy();
  });

  it('should validate the password control with required and pattern validators', () => {
    const passwordControl = component.passwordConfirmForm.get('password');
    
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['required']).toBeTruthy();
    
    passwordControl?.setValue('weakpass');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['pattern']).toBeTruthy();

    passwordControl?.setValue('StrongPass123@');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate passwordConfirm control as required', () => {
    const passwordConfirmControl = component.passwordConfirmForm.get('passwordConfirm');

    passwordConfirmControl?.setValue('');
    expect(passwordConfirmControl?.valid).toBeFalsy();
    expect(passwordConfirmControl?.errors?.['required']).toBeTruthy();

    passwordConfirmControl?.setValue('StrongPass123@');
    expect(passwordConfirmControl?.valid).toBeTruthy();
  });

  it('should validate that passwords match using the custom validatePasswords validator', () => {
    const passwordControl = component.passwordConfirmForm.get('password');
    const passwordConfirmControl = component.passwordConfirmForm.get('passwordConfirm');
    
    passwordControl?.setValue('StrongPass123@');
    passwordConfirmControl?.setValue('StrongPass123@');
    expect(component.passwordConfirmForm.errors).toBeNull();

    passwordConfirmControl?.setValue('DifferentPass123@');
    expect(component.passwordConfirmForm.errors?.['notSame']).toBeTruthy();
  });

  it('should toggle the showPassword flag when revealPassword is called', () => {
    expect(component.showPassword).toBe(false);
    component.revealPassword();
    expect(component.showPassword).toBe(true);
    component.revealPassword();
    expect(component.showPassword).toBe(false);
  });

  it('should render the password input fields and the reveal password button', () => {
    const passwordInput = fixture.debugElement.query(By.css('input[name="password"]'));
    const passwordConfirmInput = fixture.debugElement.query(By.css('input[name="confirm"]'));
    const revealButton = fixture.debugElement.query(By.css('input[name="reveal-password"]'));

    expect(passwordInput).toBeTruthy();
    expect(passwordConfirmInput).toBeTruthy();
    expect(revealButton).toBeTruthy();
  });
});
