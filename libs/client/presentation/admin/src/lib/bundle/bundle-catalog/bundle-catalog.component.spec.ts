import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BundleCatalogComponent } from './bundle-catalog.component';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { IBundleSales } from '@paris-2024/shared-interfaces';
import { BundleService } from '@paris-2024/client-data-access-bundle';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { CurrencyPipe } from '@angular/common';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

describe('BundleCatalogComponent', () => {
  let component: BundleCatalogComponent;
  let fixture: ComponentFixture<BundleCatalogComponent>;
  let bundleService: jest.Mocked<BundleService>;
  let router: jest.Mocked<Router>;

  const mockBundles: IBundleSales[] = [
    { bundle:{name: 'Bundle A', price: 100}, sales: 10 } as unknown as IBundleSales,
    { bundle:{name: 'Bundle B', price: 150}, sales: 5 } as unknown as IBundleSales,
  ];

  beforeEach(async () => {
    const bundleServiceMock = {
      getWithSales: jest.fn().mockReturnValue(of(mockBundles))
    };

    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        BundleCatalogComponent,
        FormatPricePipe,
        CurrencyPipe,
        RouteButtonComponent
      ],
      providers: [
        { provide: BundleService, useValue: bundleServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BundleCatalogComponent);
    component = fixture.componentInstance;
    bundleService = TestBed.inject(BundleService) as jest.Mocked<BundleService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load bundle sales on init', () => {
    expect(bundleService.getWithSales).toHaveBeenCalled();
    expect(component.bundleSales).toEqual(mockBundles);
  });

  it('should navigate to the update route on editBundle()', () => {
    const id = '1';
    component.editBundle(id);
    expect(router.navigate).toHaveBeenCalledWith([`admin/bundles/update/${id}`]);
  });
});
