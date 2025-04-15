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

  it('should return { passwordMismatch: true } when passwords do not match', () => {
    formGroup.get('password')?.setValue('password123');
    formGroup.get('passwordConfirm')?.setValue('differentPassword');
    const result: ValidationErrors | null = validatePasswords(formGroup);
    expect(result).toEqual({ passwordMismatch: true });
  });

  it('should return null when both password and passwordConfirm are empty', () => {
    formGroup.get('password')?.setValue('');
    formGroup.get('passwordConfirm')?.setValue('');
    const result: ValidationErrors | null = validatePasswords(formGroup);
    expect(result).toBeNull();
  });

  it('should return { passwordMismatch: true } when one of the passwords is empty', () => {
    formGroup.get('password')?.setValue('password123');
    formGroup.get('passwordConfirm')?.setValue('');
    const result: ValidationErrors | null = validatePasswords(formGroup);
    expect(result).toEqual({ passwordMismatch: true });
  });
});
