import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Bundle, BundleService } from '@paris-2024/client-data-access-bundle';
import { BundleCatalogComponent } from './bundle-catalog.component';

describe('BundleCatalogComponent', () => {
  let component: BundleCatalogComponent;
  let fixture: ComponentFixture<BundleCatalogComponent>;
  let bundleService: jest.Mocked<BundleService>;

  const createComponent = (bundles: Bundle[] | null) => {
    bundleService.findAll.mockReturnValue(of(bundles as Bundle[]));
    fixture = TestBed.createComponent(BundleCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    bundleService = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<BundleService>;

    await TestBed.configureTestingModule({
      imports: [BundleCatalogComponent],
      providers: [{ provide: BundleService, useValue: bundleService }],
    })
    .overrideComponent(BundleCatalogComponent, { set: { imports: [], template: '' } })
    .compileComponents();
  });

  it('should list bundles sorted by ticket amount', () => {
    createComponent([
      { id: 'family', ticketAmount: 4 },
      { id: 'solo', ticketAmount: 1 },
      { id: 'duo', ticketAmount: 2 },
    ] as Bundle[]);

    expect(component.bundles.map(b => b.id)).toEqual(['solo', 'duo', 'family']);
  });

  it('should show an empty catalog when bundles cannot be loaded', () => {
    createComponent(null);

    expect(component.bundles).toEqual([]);
  });

  it('should unsubscribe on destroy', () => {
    createComponent([]);

    fixture.destroy();

    expect(component.bundleSubscription.closed).toBe(true);
  });
});
