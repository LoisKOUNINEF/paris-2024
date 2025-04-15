import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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

  const mockUserPlain = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password123',
    role: 'customer',
    cartId: null,
    id: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null
  };

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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with user data', () => {
    expect(component.editUserForm).toBeDefined();
    expect(component.editUserForm.get('email')).toBeDefined();
    expect(component.editUserForm.get('userInfos')).toBeDefined();
    expect(component.editUserForm.value).toEqual({
      email: mockUserPlain,
      userInfos: mockUserPlain
    });
  });

  it('should emit submitted event on form submission', () => {
    jest.spyOn(component.submitted, 'emit');
    const updatedUserData = {
      email: { email: 'updated@example.com' },
      userInfos: { firstName: 'Jane', lastName: 'Doe' }
    };
    component.editUserForm.patchValue(updatedUserData);
    component.onSubmit();
    expect(component.submitted.emit).toHaveBeenCalledWith({
      email: 'updated@example.com',
      firstName: 'Jane',
      lastName: 'Doe'
    });
  });

  it('should parse user form correctly', () => {
    const updatedUserData = {
      email: { email: 'updated@example.com' },
      userInfos: { firstName: 'Jane', lastName: 'Doe' }
    };
    component.editUserForm.patchValue(updatedUserData);
    const result = component['parseUserForm']();
    expect(result).toEqual({
      email: 'updated@example.com',
      firstName: 'Jane',
      lastName: 'Doe'
    });
  });

  it('should disable submit button when form is invalid', () => {
    component.editUserForm.setErrors({ 'incorrect': true });
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

  it('should update form when user input changes', () => {
    const newUser = new User(
      'new@example.com',
      'Jane',
      'Smith',
      'newpassword123',
      Roles.ADMIN
    );
    const newUserPlain = {
      email: 'new@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: 'newpassword123',
      role: Roles.ADMIN,
      cartId: null,
      id: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    };
    component.user = newUser;
    component.ngOnInit();
    expect(component.editUserForm.value).toEqual({
      email: newUserPlain,
      userInfos: newUserPlain
    });
  });
});
