import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { Bundle } from '@paris-2024/client-data-access-bundle';

@Component({
  selector: 'lib-bundle-card',
  standalone: true,
  imports: [CurrencyPipe, FormatPricePipe, CommonModule],
  templateUrl: './bundle-card.component.html',
  styleUrl: './bundle-card.component.scss',
})
export class BundleCardComponent {
  imageUrl = 'assets/images/medal.avif';
  imageAlt = 'Une sportive souriante avec sa médaile.';

  @Input({ required: true }) bundle: Bundle;
}
