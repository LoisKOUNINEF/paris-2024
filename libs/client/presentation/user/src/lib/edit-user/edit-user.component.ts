import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserDto, UserFormValue, UserService } from '@paris-2024/client-data-access-user';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { EditUserFormComponent, EditPasswordFormComponent } from '@paris-2024/client-ui-forms';
import { SnackbarService } from '@paris-2024/client-utils';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'lib-edit-user',
  standalone: true,
  imports: [
    EditUserFormComponent,
    EditPasswordFormComponent,
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit, OnDestroy{
  subscription: Subscription = new Subscription;
  user: User;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
  ) { }

  ngOnInit(): void {
    this.userService.findCurrentUser()
      .pipe(filter(res => !!res))
      .subscribe((user) => {
        this.user = user;
      }
    )
  }

  ngOnDestroy(): void {
    if(this.subscription) this.subscription.unsubscribe();
  }  

  editInfos(userFormValue: UserFormValue): Subscription | Promise<boolean> {
    const user = new UserDto(userFormValue as UserFormValue);
    return this.subscription = this.userService.update(user, this.user.id)
      .pipe(filter(res => !!res))
      .subscribe((res: User) => {
        this.snackbarService.showSuccess('Modifications enregistrées.')
          .afterDismissed()
        this.router.navigate(['/user']);
    })
  }

  editPassword(userFormValue: UserFormValue) {
    const user = new UserDto(userFormValue as UserFormValue);
    return this.subscription = this.userService.update(user, this.user.id)
      .pipe(filter(res => !!res))
      .subscribe((res: User) => {
        this.snackbarService.showSuccess('Mot de passe modifié.')
          .afterDismissed()
        this.router.navigate(['/user']);
    })  
  }

  delete() {
    return this.subscription = this.userService.delete(this.user.id)
      .pipe(filter(res => !!res))
      .subscribe((res: User) => {
        this.snackbarService.showSuccess('Compte suspendu.')
          .afterDismissed()
        this.authService.logout()
          .subscribe(() => this.router.navigate(['/']) 
        );
    })    
  }
}
