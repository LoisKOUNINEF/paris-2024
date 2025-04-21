import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  EmailFormComponent, 
  SubmitButtonComponent, 
  PasswordConfirmFormComponent, 
  UserInfosFormComponent 
} from '@paris-2024/client-ui-form-building-blocks';
import { UserFormValue } from '@paris-2024/client-data-access-user';

@Component({
  selector: 'lib-full-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    EmailFormComponent,
    PasswordConfirmFormComponent,
    UserInfosFormComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './full-user-form.component.html',
  styleUrl: './full-user-form.component.scss',
})
export class FullUserFormComponent implements OnInit {
  @Output() submitted: EventEmitter<UserFormValue> = new EventEmitter;
  fullUserForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() { 
    this.fullUserForm = this.formBuilder.group({
      email: this.formBuilder.group({}, 
        { validators: Validators.required }
      ),
      passwordConfirm: this.formBuilder.group({}, 
        { validators: Validators.required }
      ),
      userInfos: this.formBuilder.group({}, 
        { validators: Validators.required }
      )
    }); 
  }

  onSubmit() {
    this.submitted.emit(this.parseUserForm())
  }

  protected parseUserForm(): UserFormValue {
    const userDtoValues: UserFormValue = {
      email: this.fullUserForm.value.email.email,
      password: this.fullUserForm.value.passwordConfirm.password,
      firstName: this.fullUserForm.value.userInfos.firstName,
      lastName: this.fullUserForm.value.userInfos.lastName
    }
    return userDtoValues;
  }
}
