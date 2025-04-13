import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@paris-2024/client-data-access-user';
import { CommonFormComponent } from '../common-form.component';
import { RevealPasswordPipe, PwdCheckboxTextPipe } from '@paris-2024/client-utils';

@Component({
  selector: 'lib-password-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    RevealPasswordPipe, 
    PwdCheckboxTextPipe,
  ],
  templateUrl: './password-form.component.html',
  styleUrl: './password-form.component.scss',
})
export class PasswordFormComponent extends CommonFormComponent implements OnInit {
  showPassword = false;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    this.passwordForm = this.controlContainer.control as FormGroup;
    this.passwordForm.addControl<User['password']>('password',
      this.formBuilder.control<User['password']>('',[
        Validators.required,
        Validators.pattern(
/*
  ensures at least 10 characters (1 lowercase & 1 uppercase),
  1 number, 1 special character (@#$%^&+=)
*/
        '^(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=]).*$'
      )]
    ))
  }

  revealPassword() {
    this.showPassword = !this.showPassword;
  }
}
