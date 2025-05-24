import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmailFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { UserDto } from '@paris-2024/client-data-access-user';
import { PasswordResetService } from '@paris-2024/client-data-access-password-reset';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'lib-request-password-reset-link',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    EmailFormComponent, 
    SubmitButtonComponent,
  ],
  templateUrl: './request-password-reset-link.component.html',
  styleUrl: './request-password-reset-link.component.scss',
})
export class RequestPasswordResetLinkComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription;
  requestResetLinkForm!: FormGroup;

  constructor(
    private passwordResetService: PasswordResetService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.requestResetLinkForm = this.formBuilder.group({
      email: this.formBuilder.group({},
        Validators.required
      )
    })  
  }

  ngOnDestroy(): void {
    if(this.subscription) this.subscription.unsubscribe();
  }

  sendPwdResetLink(): Subscription | Promise<boolean> {
    if (!this.requestResetLinkForm.valid) {
      return this.router.navigate(['password-reset']);
    };

    const user = new UserDto({
      email: this.requestResetLinkForm.value.email.email
    });

    return this.subscription = this.passwordResetService.sendPwdResetLink(user)
      .pipe(filter(res => !!res))
      .subscribe(() => {
        this.router.navigate(['password-reset/reset-link-sent'])
      }
    )
  }
}

