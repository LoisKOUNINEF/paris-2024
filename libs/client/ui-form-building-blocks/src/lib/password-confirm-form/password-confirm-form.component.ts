import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@paris-2024/client-data-access-user';
import { CommonFormComponent } from '../common-form.component';
import { RevealPasswordPipe, PwdCheckboxTextPipe } from '@paris-2024/client-utils';
import { validatePasswords } from '../validators/validate-passwords.validator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-password-confirm-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule, 
    RevealPasswordPipe, 
    PwdCheckboxTextPipe,
  ],
  templateUrl: './password-confirm-form.component.html',
  styleUrl: './password-confirm-form.component.scss',
})
export class PasswordConfirmFormComponent extends CommonFormComponent implements OnInit {
  showPassword = false;
  passwordConfirmForm!: FormGroup;

  ngOnInit(): void {
    this.passwordConfirmForm = this.controlContainer.control as FormGroup;
    this.passwordConfirmForm.addControl<User['password']>('password',
      this.formBuilder.control<User['password']>('', [
        Validators.required,
        Validators.pattern(
/*
  ensures at least 10 characters (1 lowercase & 1 uppercase),
  1 number, 1 special character (@#$%^&+=)
*/
        '^(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=]).*$'
      )]
    ));
    this.passwordConfirmForm.addControl<User['password']>('passwordConfirm',
      this.formBuilder.control<User['password']>('', 
        Validators.required
      ),
    )
    this.passwordConfirmForm.addValidators(validatePasswords)
  }

  revealPassword() {
    this.showPassword = !this.showPassword;
  }
}
