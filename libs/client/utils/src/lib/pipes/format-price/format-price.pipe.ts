import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPrice',
  standalone: true
})
export class FormatPricePipe implements PipeTransform {
  transform(price: number): number {
    if (price <= 0) {
      return 0;
    }
    return price / 100;
  }
}
