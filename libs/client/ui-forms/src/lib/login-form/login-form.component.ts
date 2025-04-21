import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserFormValue } from '@paris-2024/client-data-access-user';
import { EmailFormComponent, PasswordFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';

@Component({
  selector: 'lib-login-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    EmailFormComponent,
    PasswordFormComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent implements OnInit {
  @Output() submitted: EventEmitter<UserFormValue> = new EventEmitter;
  loginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: this.formBuilder.group({},
        Validators.required
      ),
      password: this.formBuilder.group({},
        Validators.required
      ),
    })
  }

  onSubmit() {
    if (!this.loginForm.valid) return;
    this.submitted.emit(this.parseUserForm())
  }

  protected parseUserForm(): UserFormValue {
    const userDtoValues: UserFormValue = {
      email: this.loginForm.value.email.email,
      password: this.loginForm.value.password.password,
    }
    return userDtoValues;
  }
}
