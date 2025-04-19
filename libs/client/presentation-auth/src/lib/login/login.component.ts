import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoginFormComponent } from '@paris-2024/client-ui-forms';
import { Subscription } from 'rxjs';
import { UserDto, UserFormValue, User } from '@paris-2024/client-data-access-user';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { SnackbarService } from '@paris-2024/client-utils';

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [LoginFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  subscription: Subscription = new Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
  ) { }
  
  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
  }

  login(userFormValue: UserFormValue): Subscription | Promise<boolean> {
    const user = new UserDto(userFormValue as UserFormValue);

    return this.subscription = this.authService.login(user)
      .subscribe((res: User) => {
        this.snackbarService.showSuccess('Vous êtes connecté.').afterDismissed();
        if (this.authService.isAdmin()) {
          this.router.navigate(['admin']);
        } else {
          this.router.navigate(['shop']);
        };
      }
    );
  }

  goToResetPassword() {
    this.router.navigate(['password-reset/request-reset-link']);
  }

  goToSignup() {
    this.router.navigate(['auth/signup']);
  }
}
