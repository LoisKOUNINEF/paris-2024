import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordFormComponent } from './password-form.component';
import { ReactiveFormsModule, FormGroup, ControlContainer, AbstractControl } from '@angular/forms';
import { RevealPasswordPipe, PwdCheckboxTextPipe } from '@paris-2024/client-utils';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

class MockControlContainer {
  control: AbstractControl = new FormGroup({});
}

describe('PasswordConfirmFormComponent', () => {
  let component: PasswordFormComponent;
  let fixture: ComponentFixture<PasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        PasswordFormComponent,
        RevealPasswordPipe,
        PwdCheckboxTextPipe
      ],
      providers: [
        { 
          provide: ControlContainer, 
          useClass: MockControlContainer 
        }, 
        provideNoopAnimations(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with password and password controls', () => {
    expect(component.passwordForm.contains('password')).toBeTruthy();
  });

  it('should validate the password control with required and pattern validators', () => {
    const passwordControl = component.passwordForm.get('password');
    
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['required']).toBeTruthy();
    
    passwordControl?.setValue('weakpass');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['pattern']).toBeTruthy();

    passwordControl?.setValue('StrongPass123@');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate password control as required', () => {
    const passwordControl = component.passwordForm.get('password');

    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['required']).toBeTruthy();

    passwordControl?.setValue('StrongPass123@');
    expect(passwordControl?.valid).toBeTruthy();
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
    const revealButton = fixture.debugElement.query(By.css('input[name="reveal-password"]'));

    expect(passwordInput).toBeTruthy();
    expect(revealButton).toBeTruthy();
  });
});
