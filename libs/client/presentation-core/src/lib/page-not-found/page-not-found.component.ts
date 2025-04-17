import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { OlympicRingsComponent, RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { PlatformService } from '@paris-2024/client-utils';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'lib-page-not-found',
  standalone: true,
  imports: [
    RouteButtonComponent,
    OlympicRingsComponent,
  ],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
  private delayToRedirect = 5000;
  time = this.delayToRedirect / 1000;
  private intervalId: any;
  private routerSubscription: Subscription;

  constructor(
    private router: Router,
    private platformService: PlatformService,
  ) { }

  ngOnInit(): void {
    if(this.platformService.isBrowser) {
      this.countdownToRedirect();
    };
    this.routerSubscription = this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart)
      )
      .subscribe(() => {
        const targetComponent = this.router.getCurrentNavigation()?.extras.state?.['sameComponent'] || PageNotFoundComponent;

        if (targetComponent !== PageNotFoundComponent) {
          this.clearInterval();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.clearInterval();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  redirectToHome(): void {
    this.router.navigate(['']);
  };

  clearInterval() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private countdownToRedirect(): void {
    this.intervalId = setInterval(
      () => this.decreaseCountdown(), 
      1000,
    )
  };

  private decreaseCountdown(): void {
    this.time -= 1;
    if(this.time <= 0) {
      this.redirectToHome();
    }
  };
}
