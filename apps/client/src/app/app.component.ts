import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NavigationCancel, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { NavbarComponent } from '@paris-2024/client-presentation-core';
import { LoadingSpinnerComponent } from '@paris-2024/client-ui-shared';
import { PlatformService } from '@paris-2024/client-utils';
import { filter, Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    NavbarComponent, 
    RouterModule, 
    MatSnackBarModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Paris 2024';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location: any;
  subscriptions: Array<Subscription> = [];
  routerSubscription: Subscription = new Subscription;
  userStatusSubscription: Subscription = new Subscription;
  loading = true;

  constructor(
    private router: Router,
    private platformService: PlatformService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      this.checkUserStatus();
    }
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  // smoother navigation using browser arrows
  recallJsFuntions() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => 
          event instanceof NavigationEnd 
          || event instanceof NavigationCancel
      ))
      .subscribe(event => {
        this.location = this.router.url;
        if (!(event instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0);
    });
    this.subscriptions.push(this.routerSubscription);
  }

  checkUserStatus() {
    this.userStatusSubscription = this.authService.checkUserStatus()
      .subscribe({
        complete: () => {
          this.loading = false;
        }
      });
    this.subscriptions.push(this.userStatusSubscription);
  }
}
