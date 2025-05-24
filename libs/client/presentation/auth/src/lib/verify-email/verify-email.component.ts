import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from '@paris-2024/client-utils';
import { LoadingSpinnerComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-verify-email',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription;
  loading = true;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private platformService: PlatformService,
  ) {}

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      this.verifyEmail();
    }
  }

  private async verifyEmail() {
    const token = this.route.snapshot.params['token'];
    if(!token) {
      this.loading = false;
      this.error = 'Lien de vérification invalide'
      return;
    }

    this.subscription = this.authService.verifyEmail(token)
      .subscribe((res) => {
        this.loading = false;
        if (res === false) {
          this.error = 'Lien de vérification invalide';
          return;
        } else {
          this.success = 'Email validé !'
        }
      })
    }

  goToLogin() {
    this.router.navigate(['auth/login']);
  }

  ngOnDestroy(): void {
    if(this.subscription) this.subscription.unsubscribe();
  }

}
