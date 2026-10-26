import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@paris-2024/client-data-access-user';
import { CommonFormComponent } from '../../common-form.component';
import { RevealPasswordPipe, PwdCheckboxTextPipe } from '@paris-2024/client-utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-current-password-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule,
    RevealPasswordPipe, 
    PwdCheckboxTextPipe,
  ],
  templateUrl: './current-password-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './current-password-form.component.scss',
})
export class CurrentPasswordFormComponent extends CommonFormComponent implements OnInit {
  @Input() required = true;
  @Input() hint = '';
  showPassword = false;
  currentPasswordForm!: FormGroup;

  ngOnInit(): void {
    this.currentPasswordForm = this.controlContainer.control as FormGroup;
    // no pattern check: the server compares it with the stored password
    this.currentPasswordForm.addControl<User['password']>('currentPassword',
      this.formBuilder.control<User['password']>('',
        this.required ? Validators.required : []
      )
    )
  }

  revealPassword() {
    this.showPassword = !this.showPassword;
  }
}
