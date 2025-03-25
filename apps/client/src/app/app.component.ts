import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NavigationCancel, NavigationEnd, Router, RouterModule } from '@angular/router';
import { PlatformService } from '@paris-2024/client-utils';
import { filter, Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    RouterModule, 
    MatSnackBarModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Paris 2024';
  location: any;
  subscriptions: Array<Subscription> = [];
  routerSubscription: Subscription = new Subscription;
  loading = true;

  constructor(
    private router: Router,
    private platformService: PlatformService,
  ) { }

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      console.log('Is Browser')
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
}
