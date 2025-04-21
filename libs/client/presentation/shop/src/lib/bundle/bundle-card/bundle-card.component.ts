import { Component, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { Bundle } from '@paris-2024/client-data-access-bundle';

@Component({
  selector: 'lib-bundle-card',
  standalone: true,
  imports: [CurrencyPipe, FormatPricePipe],
  templateUrl: './bundle-card.component.html',
  styleUrl: './bundle-card.component.scss',
})
export class BundleCardComponent {
  @Input({ required: true }) bundle: Bundle;
}
