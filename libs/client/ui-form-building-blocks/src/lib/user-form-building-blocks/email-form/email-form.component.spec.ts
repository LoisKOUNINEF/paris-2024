import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailFormComponent } from './email-form.component';
import { ReactiveFormsModule, FormGroup, ControlContainer, AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

class MockControlContainer {
  control: AbstractControl = new FormGroup({});
}

describe('EmailFormComponent', () => {
  let component: EmailFormComponent;
  let fixture: ComponentFixture<EmailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EmailFormComponent],
      providers: [
        { 
        provide: ControlContainer, 
        useClass: MockControlContainer 
        },
        provideNoopAnimations(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with an email control', () => {
    expect(component.emailForm.contains('email')).toBeTruthy();
  });

  it('should make the email control required and validate email format', () => {
    const emailControl = component.emailForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['required']).toBeTruthy();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should render the email input field in the template', () => {
    const emailInput = fixture.debugElement.query(By.css('input[name="email"]'));
    expect(emailInput).toBeTruthy();
  });
});
