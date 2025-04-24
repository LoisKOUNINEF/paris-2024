import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BundleCardComponent } from '../bundle-card/bundle-card.component';
import { AddToCartComponent } from '../../cart/add-to-cart/add-to-cart.component';
import { SortArrayPipe } from '@paris-2024/client-utils';
import { Bundle, BundleService } from '@paris-2024/client-data-access-bundle';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-bundle-catalog',
  standalone: true,
  imports: [
    BundleCardComponent,
    AddToCartComponent,
  ],
  providers: [SortArrayPipe],
  templateUrl: './bundle-catalog.component.html',
  styleUrl: './bundle-catalog.component.scss',
})
export class BundleCatalogComponent implements OnInit, OnDestroy {
  private sortArray = inject(SortArrayPipe);
  bundles: Array<Bundle> = [];
  bundleSubscription: Subscription = new Subscription;

  constructor(private bundleService: BundleService) {}

  ngOnInit(): void {
    this.bundleSubscription = this.bundleService.findAll()
      .subscribe((bundles: Array<Bundle>) => {
        this.bundles = this.sortArray.transform(bundles, 'ticketAmount');
      })  
  }

  ngOnDestroy(): void {
    if(this.bundleSubscription) {
      this.bundleSubscription.unsubscribe();
    }
  }
}
