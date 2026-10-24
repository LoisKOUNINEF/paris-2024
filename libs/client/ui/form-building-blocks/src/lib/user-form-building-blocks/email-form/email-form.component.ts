import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonFormComponent } from '../../common-form.component';
import { User } from '@paris-2024/client-data-access-user';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-email-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule,
  ],
  templateUrl: './email-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './email-form.component.scss',
})
export class EmailFormComponent extends CommonFormComponent implements OnInit {
  emailForm!: FormGroup;

  ngOnInit(): void {
    this.emailForm = this.controlContainer.control as FormGroup;
    this.emailForm.addControl<User['email']>('email', 
      this.formBuilder.control<User['email']>('', 
        [
          Validators.required, 
          Validators.email
        ]
      )
    )    
  }
}
