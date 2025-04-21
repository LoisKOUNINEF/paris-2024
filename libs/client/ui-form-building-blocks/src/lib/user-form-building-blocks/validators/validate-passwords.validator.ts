import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const validatePasswords: ValidatorFn = (control: AbstractControl):  ValidationErrors | null => { 
  const password = control.get('password');
  const confirmPass = control.get('passwordConfirm');

  if (!password || !confirmPass) return null;

  if (confirmPass.value === '') return null;

  const error = password.value === confirmPass.value ? null : { passwordMismatch: true };

  if (error) {
    confirmPass.setErrors({ ...confirmPass.errors, passwordMismatch: true });
  } else {
    const errors = { ...confirmPass.errors };
    delete errors['passwordMismatch'];
    if (Object.keys(errors).length === 0) {
      confirmPass.setErrors(null);
    } else {
      confirmPass.setErrors(errors);
    }
  }

  return null;
}
