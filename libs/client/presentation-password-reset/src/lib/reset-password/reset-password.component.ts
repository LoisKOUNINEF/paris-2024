import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordConfirmFormComponent, SubmitButtonComponent } from '@paris-2024/client-ui-form-building-blocks';
import { UserDto, UserFormValue } from '@paris-2024/client-data-access-user';
import { PasswordResetService } from '@paris-2024/client-data-access-password-reset';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'lib-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    PasswordConfirmFormComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  token = '';
  subscription: Subscription = new Subscription;
  resetPasswordForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private passwordResetService: PasswordResetService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    this.resetPasswordForm = this.formBuilder.group({
      passwordConfirm: this.formBuilder.group({},
        Validators.required
      ),
    });
  }

  ngOnDestroy(): void {
    if(this.subscription) this.subscription.unsubscribe();
  }

  resetPassword(): Subscription | Promise<boolean> {
    if(!this.resetPasswordForm.valid) {
      return this.router.navigate([`password-reset/${this.token}`])
    } 
    const user = new UserDto({
      password: this.resetPasswordForm.value.passwordConfirm.password,
    } as UserFormValue);

    return this.subscription = this.passwordResetService.resetPwd(user, this.token)
      .pipe(filter( res => !!res))
      .subscribe(() => {
        this.router.navigate(['auth/login'])
      }
    )
  }
}
