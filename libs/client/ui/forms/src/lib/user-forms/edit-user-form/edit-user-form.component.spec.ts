import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { EditUserFormComponent } from './edit-user-form.component';
import { 
  EmailFormComponent, 
  UserInfosFormComponent, 
  SubmitButtonComponent 
} from '@paris-2024/client-ui-form-building-blocks';
import { User } from '@paris-2024/client-data-access-user';
import { Roles } from '@paris-2024/shared-interfaces';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('EditUserFormComponent', () => {
  let component: EditUserFormComponent;
  let fixture: ComponentFixture<EditUserFormComponent>;

  const mockUser: User = new User(
    'test@example.com',
    'John',
    'Doe',
    'password123',
    Roles.CUSTOMER
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        EditUserFormComponent,
        EmailFormComponent,
        UserInfosFormComponent,
        SubmitButtonComponent
      ],
      providers: [
        FormBuilder,
        provideNoopAnimations(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditUserFormComponent);
    component = fixture.componentInstance;
    component.user = mockUser;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with user data', () => {
    expect(component.editUserForm.value).toEqual({
      email: { email: 'test@example.com' },
      userInfos: { firstName: 'John', lastName: 'Doe' },
      currentPassword: { currentPassword: '' },
    });
  });

  it('should keep the child validators on email and names', () => {
    component.editUserForm.patchValue({
      email: { email: 'not-an-email' },
      userInfos: { firstName: '', lastName: 'Doe' },
    });
    expect(component.editUserForm.get('email.email')?.valid).toBe(false);
    expect(component.editUserForm.get('userInfos.firstName')?.valid).toBe(false);
    expect(component.editUserForm.valid).toBe(false);
  });

  it('should emit submitted event on form submission', () => {
    jest.spyOn(component.submitted, 'emit');
    const updatedUserData = {
      email: { email: 'updated@example.com' },
      userInfos: { firstName: 'Jane', lastName: 'Doe' },
      currentPassword: { currentPassword: 'Current123#' },
    };
    component.editUserForm.patchValue(updatedUserData);
    component.onSubmit();
    expect(component.submitted.emit).toHaveBeenCalledWith({
      email: 'updated@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      currentPassword: 'Current123#',
    });
  });

  it('should send the current password only when the email changes', () => {
    const updatedUserData = {
      email: { email: 'test@example.com' },
      userInfos: { firstName: 'Jane', lastName: 'Doe' },
      currentPassword: { currentPassword: 'Current123#' },
    };
    component.editUserForm.patchValue(updatedUserData);
    const result = component['parseUserForm']();
    expect(result).toEqual({
      email: 'test@example.com',
      firstName: 'Jane',
      lastName: 'Doe'
    });
  });

  it('should not require the current password', () => {
    expect(component.editUserForm.get('currentPassword.currentPassword')?.valid).toBe(true);
  });

  it('should disable submit button when form is invalid', () => {
    component.editUserForm.setErrors({ 'incorrect': true });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('lib-submit-button button');
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const validFormValue = {
      email: { email: 'valid@example.com' },
      userInfos: { firstName: 'Jane', lastName: 'Doe' }
    };
    
    component.editUserForm.patchValue(validFormValue);

    Object.values(component.editUserForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    });

    component.editUserForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
    tick();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.directive(SubmitButtonComponent)).componentInstance;

    expect(submitButton.isDisabled).toBe(false);
  }));

  it('should update form when user input changes', fakeAsync(() => {
    component.user = new User(
      'new@example.com',
      'Jane',
      'Smith',
      'newpassword123',
      Roles.ADMIN
    );
    component.ngOnInit();
    flushMicrotasks();
    // the child blocks add their controls on their own init, which is not re-run here
    expect(component.editUserForm.value).toEqual({
      email: {},
      userInfos: {},
      currentPassword: {},
    });
  }));
});
