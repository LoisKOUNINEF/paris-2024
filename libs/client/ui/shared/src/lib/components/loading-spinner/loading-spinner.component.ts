import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'lib-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {}
