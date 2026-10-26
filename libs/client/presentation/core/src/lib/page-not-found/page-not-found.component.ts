import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { OlympicRingsComponent, RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { PlatformService } from '@paris-2024/client-utils';

@Component({
  selector: 'lib-page-not-found',
  imports: [
    RouteButtonComponent,
    OlympicRingsComponent,
  ],
  templateUrl: './page-not-found.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './page-not-found.component.scss',
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
  private delayToRedirect = 5000;
  time = this.delayToRedirect / 1000;
  private intervalId: any;

  constructor(
    private router: Router,
    private platformService: PlatformService,
  ) { }

  ngOnInit(): void {
    if(this.platformService.isBrowser) {
      this.countdownToRedirect();
    };
  }

  ngOnDestroy(): void {
    this.clearInterval();
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
      // redirect only once, even if this component stays on screen (e.g. another unknown url)
      this.clearInterval();
      this.redirectToHome();
    }
  };
}
