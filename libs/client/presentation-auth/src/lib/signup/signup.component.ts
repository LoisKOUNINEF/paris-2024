import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { UserDto, UserFormValue, User } from '@paris-2024/client-data-access-user';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { FullUserFormComponent } from '@paris-2024/client-ui-forms';

@Component({
  selector: 'lib-signup',
  standalone: true,
  imports: [FullUserFormComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnDestroy {
  subscription: Subscription = new Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
  }  

  signup(userFormValue: UserFormValue): Subscription | Promise<boolean> {
    const user = new UserDto(userFormValue as UserFormValue);
    return this.subscription = this.authService.signup(user)
      .pipe(filter(res => !!res))
      .subscribe((res: User) => {
        this.authService.login(user)
        .subscribe(() => {
          this.router.navigate(['shop'])
      }) 
    })
  }

  goToLogin() {
    this.router.navigate(['auth/login']);
  }
}
