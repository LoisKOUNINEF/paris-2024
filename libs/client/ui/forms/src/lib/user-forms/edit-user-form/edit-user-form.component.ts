import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailFormComponent, UserInfosFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { UserFormValue, User } from '@paris-2024/client-data-access-user';

@Component({
  selector: 'lib-edit-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    EmailFormComponent, 
    UserInfosFormComponent, 
    SubmitButtonComponent,
  ],
  templateUrl: './edit-user-form.component.html',
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
      email: this.formBuilder.group({...this.user}, 
        { validators: Validators.required }
      ),
      userInfos: this.formBuilder.group({...this.user}, 
        { validators: Validators.required }
      )
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
    return userDtoValues;
  }

  private populateFields() {
    if(this.user) {
      this.editUserForm.patchValue({
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
      })
    }
  }
}
