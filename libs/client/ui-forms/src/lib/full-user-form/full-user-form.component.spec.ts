import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FullUserFormComponent } from './full-user-form.component';
import { 
  EmailFormComponent, 
  SubmitButtonComponent, 
  PasswordConfirmFormComponent, 
  UserInfosFormComponent 
} from '@paris-2024/client-ui-form-building-blocks';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('FullUserFormComponent', () => {
  let component: FullUserFormComponent;
  let fixture: ComponentFixture<FullUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FullUserFormComponent,
        EmailFormComponent,
        PasswordConfirmFormComponent,
        UserInfosFormComponent,
        SubmitButtonComponent
      ],
      providers: [
        FormBuilder,
        provideNoopAnimations(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FullUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.fullUserForm).toBeDefined();
    expect(component.fullUserForm.get('email')).toBeDefined();
    expect(component.fullUserForm.get('passwordConfirm')).toBeDefined();
    expect(component.fullUserForm.get('userInfos')).toBeDefined();
  });

  it('should emit submitted event on form submission', () => {
    jest.spyOn(component.submitted, 'emit');
    const userFormValue = {
      email: { email: 'test@example.com' },
      passwordConfirm: { password: 'password123' },
      userInfos: { firstName: 'John', lastName: 'Doe' }
    };
    component.fullUserForm.patchValue(userFormValue);
    component.onSubmit();
    expect(component.submitted.emit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
  });

  it('should parse user form correctly', () => {
    const userFormValue = {
      email: { email: 'test@example.com' },
      passwordConfirm: { password: 'password123' },
      userInfos: { firstName: 'John', lastName: 'Doe' }
    };
    component.fullUserForm.patchValue(userFormValue);
    const result = component['parseUserForm']();
    expect(result).toEqual({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
  });

  it('should disable submit button when form is invalid', () => {
    component.fullUserForm.setErrors({ 'incorrect': true });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('lib-submit-button');
    expect(submitButton.getAttribute('ng-reflect-is-disabled')).toBe('true');
  });

  it('should enable submit button when form is valid', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const validFormValue = {
      email: { email: 'valid@example.com' },
      passwordConfirm: { password: 'ValidPass123#', passwordConfirm: 'ValidPass123#' },
      userInfos: { firstName: 'John', lastName: 'Doe' }
    };
    
    component.fullUserForm.patchValue(validFormValue);

    Object.values(component.fullUserForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    });

    component.fullUserForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
    tick();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.directive(SubmitButtonComponent)).componentInstance;

    expect(submitButton.isDisabled).toBe(false);
  }));
});
