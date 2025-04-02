import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserInfosFormComponent } from './user-infos-form.component';
import { ReactiveFormsModule, FormGroup, ControlContainer, AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

class MockControlContainer {
  control: AbstractControl = new FormGroup({});
}

describe('UserInfosFormComponent', () => {
  let component: UserInfosFormComponent;
  let fixture: ComponentFixture<UserInfosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UserInfosFormComponent],
      providers: [{ provide: ControlContainer, useClass: MockControlContainer }]
    }).compileComponents();

    fixture = TestBed.createComponent(UserInfosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with firstName and lastName controls', () => {
    expect(component.userInfosForm.contains('firstName')).toBeTruthy();
    expect(component.userInfosForm.contains('lastName')).toBeTruthy();
  });

  it('should make the firstName and lastName controls required', () => {
    const firstNameControl = component.userInfosForm.get('firstName');
    const lastNameControl = component.userInfosForm.get('lastName');

    firstNameControl?.setValue('');
    lastNameControl?.setValue('');

    expect(firstNameControl?.valid).toBeFalsy();
    expect(firstNameControl?.errors?.['required']).toBeTruthy();
    expect(lastNameControl?.valid).toBeFalsy();
    expect(lastNameControl?.errors?.['required']).toBeTruthy();

    firstNameControl?.setValue('John');
    lastNameControl?.setValue('Doe');

    expect(firstNameControl?.valid).toBeTruthy();
    expect(lastNameControl?.valid).toBeTruthy();
  });

  it('should render the firstName and lastName input fields in the template', () => {
    const firstNameInput = fixture.debugElement.query(By.css('input[name="firstName"]'));
    const lastNameInput = fixture.debugElement.query(By.css('input[name="lastName"]'));

    expect(firstNameInput).toBeTruthy();
    expect(lastNameInput).toBeTruthy();
  });
});
