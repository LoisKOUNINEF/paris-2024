import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User } from '@paris-2024/client-data-access-user';
import { CommonFormComponent } from '../common-form.component';

export interface UserInfos {
  firstName: User['firstName'];
  lastName: User['lastName']
}

export const USER_INFOS_DEFAULT: UserInfos = {
  firstName: '',
  lastName: ''
}

@Component({
  selector: 'lib-user-infos-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule,
  ],
  templateUrl: './user-infos-form.component.html',  
  styleUrl: './user-infos-form.component.scss',

})
export class UserInfosFormComponent extends CommonFormComponent implements OnInit {
  userInfosForm!: FormGroup;

  ngOnInit(): void {
    this.userInfosForm = this.controlContainer.control as FormGroup;
    this.userInfosForm.addControl<UserInfos['firstName']>('firstName',
      this.formBuilder.control<UserInfos['firstName']>('', 
        Validators.required
      )
    )
    this.userInfosForm.addControl<UserInfos['lastName']>('lastName',
      this.formBuilder.control<UserInfos['lastName']>('', 
        Validators.required
      )
    )
  }
}
