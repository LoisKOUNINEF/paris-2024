import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentPasswordFormComponent } from './current-password-form.component';
import { ReactiveFormsModule, FormGroup, ControlContainer, AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

class MockControlContainer {
  control: AbstractControl = new FormGroup({});
}

describe('CurrentPasswordFormComponent', () => {
  let component: CurrentPasswordFormComponent;
  let fixture: ComponentFixture<CurrentPasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CurrentPasswordFormComponent,
      ],
      providers: [
        { 
          provide: ControlContainer, 
          useClass: MockControlContainer 
        }, 
        provideNoopAnimations(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentPasswordFormComponent);
    component = fixture.componentInstance;
  });

  it('should add a required currentPassword control', () => {
    fixture.detectChanges();
    const control = component.currentPasswordForm.get('currentPassword');

    control?.setValue('');
    expect(control?.errors?.['required']).toBeTruthy();
  });

  it('should not check the password pattern', () => {
    fixture.detectChanges();
    const control = component.currentPasswordForm.get('currentPassword');

    control?.setValue('weakpass');
    expect(control?.valid).toBeTruthy();
  });

  it('should make the control optional when not required', () => {
    component.required = false;
    fixture.detectChanges();

    expect(component.currentPasswordForm.get('currentPassword')?.valid).toBeTruthy();
  });

  it('should not reuse the password input id', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#currentPassword'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#password'))).toBeNull();
  });

  it('should toggle the showPassword flag when revealPassword is called', () => {
    fixture.detectChanges();
    component.revealPassword();
    expect(component.showPassword).toBe(true);
  });
});
