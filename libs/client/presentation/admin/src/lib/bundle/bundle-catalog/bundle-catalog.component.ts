import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { IBundleSales } from '@paris-2024/shared-interfaces';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { Router } from '@angular/router';
import { BundleService } from '@paris-2024/client-data-access-bundle';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-bundle-catalog',
  standalone: true,
  imports: [
    FormatPricePipe, 
    CurrencyPipe, 
    RouteButtonComponent,
  ],
  templateUrl: './bundle-catalog.component.html',
  styleUrl: './bundle-catalog.component.scss',
})
export class BundleCatalogComponent implements OnInit {
  bundleSales: Array<IBundleSales> = [];
  constructor(
    private bundleService: BundleService, 
    private router: Router,
  ) {}

  ngOnInit() {
    this.bundleService.getWithSales().subscribe((bundleSales) => {
      this.bundleSales = bundleSales;
    });
  }

  editBundle(id: string) {
    this.router.navigate([`admin/bundles/update/${id}`])
  }
}
