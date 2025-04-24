import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { IBundleSales } from '@paris-2024/shared-interfaces';
import { Observable } from 'rxjs';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-bundle-catalog',
  standalone: true,
  imports: [FormatPricePipe, CurrencyPipe],
  templateUrl: './bundle-catalog.component.html',
  styleUrl: './bundle-catalog.component.scss',
})
export class BundleCatalogComponent implements OnInit {
  bundles: Array<IBundleSales> = [];
  constructor(private apiRequest: ApiRequestService, private router: Router) {}

  ngOnInit() {
    this.getSales().subscribe((bundles) => {
      this.bundles = bundles;
    });
  }

  getSales(): Observable<Array<IBundleSales>> {
    return this.apiRequest.get<Array<IBundleSales>>(`/orders/sales`);
  }

  editBundle(id: string) {
    this.router.navigate(['admin/bundles/create'])
  }
}
