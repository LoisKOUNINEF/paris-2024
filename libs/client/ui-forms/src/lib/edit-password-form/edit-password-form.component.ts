import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserFormValue } from '@paris-2024/client-data-access-user';
import { PasswordConfirmFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';

@Component({
  selector: 'lib-edit-password-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    PasswordConfirmFormComponent, 
    SubmitButtonComponent
  ],
  templateUrl: './edit-password-form.component.html',
  styleUrl: './edit-password-form.component.scss',
})
export class EditPasswordFormComponent {
  @Output() submitted: EventEmitter<UserFormValue> = new EventEmitter;
  editPasswordForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void { 
    this.editPasswordForm = this.formBuilder.group({
      passwordConfirm: this.formBuilder.group({}, 
        { validators: Validators.required }
      ),
    })
  }

  onSubmit() {
    this.submitted.emit(this.parseUserForm())
  }

  protected parseUserForm(): UserFormValue {
    const userDtoValues: UserFormValue = {
      password: this.editPasswordForm.value.passwordConfirm.password,
    }
    return userDtoValues;
  }
}
