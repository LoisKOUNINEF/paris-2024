import { Component } from '@angular/core';
import { User, UserDto, UserFormValue } from '@paris-2024/client-data-access-user';
import { UserService } from '@paris-2024/client-data-access-user';
import { FullUserFormComponent } from '@paris-2024/client-ui-forms';
import { filter, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SnackbarService } from '@paris-2024/client-utils';

@Component({
  selector: 'lib-create-staff',
  standalone: true,
  imports: [FullUserFormComponent],
  templateUrl: './create-staff.component.html',
  styleUrl: './create-staff.component.scss',
})
export class CreateStaffComponent {
  subscription: Subscription = new Subscription;

  constructor(
    private userService: UserService,
    private router: Router,
    private snackbarService: SnackbarService,
  ) { }

  ngOnDestroy() {
    if(this.subscription) this.subscription.unsubscribe();
  }  

  createStaff(userFormValue: UserFormValue): Subscription | Promise<boolean> {
    const user = new UserDto(userFormValue as UserFormValue);
    return this.subscription = this.userService.createStaffUser(user)
      .pipe(filter(res => !!res))
      .subscribe((res: User) => {
        this.snackbarService.showSuccess('Membre du staff ajouté.')
          .afterDismissed()
        this.router.navigate(['/admin']);
    })
  }
}
