import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-password-reset-link-sent',
  imports: [RouteButtonComponent],
  templateUrl: './password-reset-link-sent.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './password-reset-link-sent.component.scss',
})
export class PasswordResetLinkSentComponent {}
