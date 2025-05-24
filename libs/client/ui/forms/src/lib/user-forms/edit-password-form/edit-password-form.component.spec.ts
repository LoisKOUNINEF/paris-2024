import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { EditPasswordFormComponent } from './edit-password-form.component';
import { PasswordConfirmFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('EditPasswordFormComponent', () => {
  let component: EditPasswordFormComponent;
  let fixture: ComponentFixture<EditPasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, 
        EditPasswordFormComponent, 
        PasswordConfirmFormComponent,
        SubmitButtonComponent
      ],
      providers: [
        FormBuilder,
        provideNoopAnimations(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.editPasswordForm).toBeDefined();
    expect(component.editPasswordForm.get('passwordConfirm')).toBeDefined();
  });

  it('should emit submitted event on form submission', () => {
    jest.spyOn(component.submitted, 'emit');
    const password = 'newPassword123';
    component.editPasswordForm.patchValue({
      passwordConfirm: { password: password }
    });
    component.onSubmit();
    expect(component.submitted.emit).toHaveBeenCalledWith({ password: password });
  });

  it('should parse user form correctly', () => {
    const password = 'testPassword123';
    component.editPasswordForm.patchValue({
      passwordConfirm: { password: password }
    });
    const result = component['parseUserForm']();
    expect(result).toEqual({ password: password });
  });

  it('should disable submit button when form is invalid', () => {
    component.editPasswordForm.setErrors({ 'incorrect': true });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('lib-submit-button');
    expect(submitButton.getAttribute('ng-reflect-is-disabled')).toBe('true');
  });

  it('should enable submit button when form is valid', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const validPassword = 'ValidPass123#';
    
    const passwordConfirmForm = component.editPasswordForm.get('passwordConfirm');
    
    passwordConfirmForm?.patchValue({
      password: validPassword,
      passwordConfirm: validPassword
    });

    passwordConfirmForm?.get('password')?.markAsTouched();
    passwordConfirmForm?.get('passwordConfirm')?.markAsTouched();

    passwordConfirmForm?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    component.editPasswordForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
    tick();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.directive(SubmitButtonComponent)).componentInstance;

    expect(submitButton.isDisabled).toBe(false);
  }));
});
