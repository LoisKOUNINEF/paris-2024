import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { validatePasswords } from './validate-passwords.validator';

describe('validatePasswords', () => {
  let formGroup: FormGroup;

  beforeEach(() => {
    formGroup = new FormGroup({
      password: new FormControl(''),
      passwordConfirm: new FormControl(''),
    });
  });

  it('should return null when passwords match', () => {
    formGroup.get('password')?.setValue('password123');
    formGroup.get('passwordConfirm')?.setValue('password123');
    const result: ValidationErrors | null = validatePasswords(formGroup);
    expect(result).toBeNull();
  });

  it('should set { passwordMismatch: true } on passwordConfirm when passwords do not match', () => {
    formGroup.addValidators(validatePasswords);
    
    formGroup.get('password')?.setValue('password123');
    const passwordConfirmControl = formGroup.get('passwordConfirm');
    passwordConfirmControl?.setValue('differentPassword');

    expect(formGroup.valid).toBeFalsy();
    expect(passwordConfirmControl?.errors?.['passwordMismatch']).toBeTruthy();
  });

  it('should return null when both password and passwordConfirm are empty', () => {
    formGroup.get('password')?.setValue('');
    formGroup.get('passwordConfirm')?.setValue('');
    const result: ValidationErrors | null = validatePasswords(formGroup);
    expect(result).toBeNull();
  });

  it('should return null when one of the passwords is empty', () => {
    formGroup.get('password')?.setValue('password123');
    formGroup.get('passwordConfirm')?.setValue('');
    const result: ValidationErrors | null = validatePasswords(formGroup);
    expect(result).toBeNull();
  });
});
