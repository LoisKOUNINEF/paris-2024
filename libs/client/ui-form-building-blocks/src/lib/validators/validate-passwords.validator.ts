import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const validatePasswords: ValidatorFn = (control: AbstractControl):  ValidationErrors | null => { 
  const pass = control.get('password')?.value;
  const confirmPass = control.get('passwordConfirm')?.value;
  return pass === confirmPass ? null : { notSame: true }
}
