import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginFormComponent } from '@paris-2024/client-ui-forms';
import { Subscription } from 'rxjs';
import { UserDto, UserFormValue, User } from '@paris-2024/client-data-access-user';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { GuestTokenService, SnackbarService } from '@paris-2024/client-utils';

@Component({
  selector: 'lib-login',
  imports: [LoginFormComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  subscription: Subscription = new Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private guestTokenService: GuestTokenService,
  ) { }
  
  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
  }

  login(userFormValue: UserFormValue): Subscription | Promise<boolean> {
    const user = new UserDto(userFormValue as UserFormValue);

    return this.subscription = this.authService.login(user)
      .subscribe((res: User) => {
        this.guestTokenService.clearGuestToken();
        this.snackbarService.showSuccess('Vous êtes connecté.');
        
        // set by the route guards, only follow app-relative urls
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
          this.router.navigateByUrl(returnUrl);
        } else if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
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
