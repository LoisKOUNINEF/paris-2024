import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@paris-2024/client-data-access-user';
import { CommonFormComponent } from '../common-form.component';
import { RevealPasswordPipe, PwdCheckboxTextPipe } from '@paris-2024/client-utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { passwordRegex } from '@paris-2024/shared-utils';

@Component({
  selector: 'lib-password-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule,
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
        Validators.pattern(passwordRegex)]
    ))
  }

  revealPassword() {
    this.showPassword = !this.showPassword;
  }
}
