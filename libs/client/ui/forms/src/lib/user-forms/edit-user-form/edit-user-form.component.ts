import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrentPasswordFormComponent, EmailFormComponent, UserInfosFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { UserFormValue, User } from '@paris-2024/client-data-access-user';

@Component({
  selector: 'lib-edit-user-form',
  imports: [
    ReactiveFormsModule, 
    EmailFormComponent, 
    UserInfosFormComponent, 
    CurrentPasswordFormComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './edit-user-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './edit-user-form.component.scss',
})
export class EditUserFormComponent implements OnInit {
  @Output() submitted: EventEmitter<UserFormValue> = new EventEmitter;
  editUserForm!: FormGroup;
  @Input() user: User | undefined;

  constructor(
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void { 
    this.editUserForm = this.formBuilder.group({
      email: this.formBuilder.group({}, 
        { validators: Validators.required }
      ),
      userInfos: this.formBuilder.group({}, 
        { validators: Validators.required }
      ),
      currentPassword: this.formBuilder.group({}),
    });
    this.populateFields();
  }

  onSubmit() {
    this.submitted.emit(this.parseUserForm())
  }

  protected parseUserForm(): UserFormValue {
    const userDtoValues: UserFormValue = {
      email: this.editUserForm.value.email.email,
      firstName: this.editUserForm.value.userInfos.firstName,
      lastName: this.editUserForm.value.userInfos.lastName
    }
    // only an email change needs the current password
    if (userDtoValues.email !== this.user?.email) {
      userDtoValues.currentPassword = this.editUserForm.value.currentPassword.currentPassword;
    }
    return userDtoValues;
  }

  // the child blocks add their controls (with validators) on their own init, patch once they exist
  private populateFields() {
    queueMicrotask(() => {
      if(this.user) {
        this.editUserForm.patchValue({
          email: { email: this.user.email },
          userInfos: {
            firstName: this.user.firstName,
            lastName: this.user.lastName,
          },
        })
      }
    });
  }
}
