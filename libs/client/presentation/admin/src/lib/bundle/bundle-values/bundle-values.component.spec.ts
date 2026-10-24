import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Bundle, BundleService } from '@paris-2024/client-data-access-bundle';
import { BundleValuesComponent } from './bundle-values.component';

describe('BundleValuesComponent', () => {
  let component: BundleValuesComponent;
  let fixture: ComponentFixture<BundleValuesComponent>;
  let bundleService: jest.Mocked<BundleService>;
  let router: jest.Mocked<Router>;

  const existingBundle = { id: 'bundle-1', name: 'Solo', price: 5000, ticketAmount: 1 } as Bundle;
  const validValues = { name: 'Duo', price: 9000, ticketAmount: 2 };

  const createComponent = (bundleId: string | null) => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap(bundleId ? { id: bundleId } : {}) } },
    });
    fixture = TestBed.createComponent(BundleValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const bundleGroup = () => component.createBundleForm.get('bundle');

  beforeEach(async () => {
    bundleService = {
      findOneById: jest.fn().mockReturnValue(of(existingBundle)),
      create: jest.fn().mockReturnValue(of(existingBundle)),
      update: jest.fn().mockReturnValue(of(existingBundle)),
      delete: jest.fn().mockReturnValue(of(existingBundle)),
    } as unknown as jest.Mocked<BundleService>;

    router = {
      navigate: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<Router>;

    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [BundleValuesComponent],
      providers: [
        { provide: BundleService, useValue: bundleService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create mode', () => {
    beforeEach(() => createComponent(null));

    it('should not load a bundle', () => {
      expect(bundleService.findOneById).not.toHaveBeenCalled();
      expect(component.bundle).toBeUndefined();
    });

    it('should be invalid until every field is filled', () => {
      expect(component.createBundleForm.valid).toBe(false);

      bundleGroup()?.setValue(validValues);

      expect(component.createBundleForm.valid).toBe(true);
    });

    it.each([
      ['an empty name', { name: '' }],
      ['a zero price', { price: 0 }],
      ['a decimal price', { price: 10.5 }],
      ['a zero ticket amount', { ticketAmount: 0 }],
    ])('should reject %s', (_, override) => {
      bundleGroup()?.setValue({ ...validValues, ...override });

      expect(component.createBundleForm.valid).toBe(false);
    });

    it('should create the bundle and go to the shop', () => {
      bundleGroup()?.setValue(validValues);

      component.onSubmit();

      expect(bundleService.create).toHaveBeenCalledWith(validValues);
      expect(bundleService.update).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['shop/bundles']);
    });

    it('should not navigate when the creation fails', () => {
      bundleService.create.mockReturnValue(of(null as unknown as Bundle));
      bundleGroup()?.setValue(validValues);

      component.onSubmit();

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not submit an invalid form', () => {
      component.onSubmit();

      expect(bundleService.create).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['admin/bundles/create']);
    });
  });

  describe('edit mode', () => {
    it('should load the bundle and fill the form', fakeAsync(() => {
      createComponent('bundle-1');
      tick();

      expect(bundleService.findOneById).toHaveBeenCalledWith('bundle-1');
      expect(component.bundle).toEqual(existingBundle);
      expect(bundleGroup()?.value).toEqual({ name: 'Solo', price: 5000, ticketAmount: 1 });
    }));

    it('should update the bundle and go back to the sales page', fakeAsync(() => {
      createComponent('bundle-1');
      tick();
      bundleGroup()?.patchValue({ price: 6000 });

      component.onSubmit();

      expect(bundleService.update).toHaveBeenCalledWith(
        { name: 'Solo', price: 6000, ticketAmount: 1 },
        'bundle-1'
      );
      expect(bundleService.create).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/admin/bundles/sales']);
    }));

    it('should delete the bundle and go back to the sales page', fakeAsync(() => {
      createComponent('bundle-1');
      tick();

      component.deleteBundle('bundle-1');

      expect(bundleService.delete).toHaveBeenCalledWith('bundle-1');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/bundles/sales']);
    }));

    it('should fall back to the create page when the bundle cannot be loaded', () => {
      bundleService.findOneById.mockReturnValue(throwError(() => new Error('not found')));

      createComponent('unknown');

      expect(component.bundle).toBeUndefined();
      expect(router.navigate).toHaveBeenCalledWith(['admin/bundles/create']);
    });

    it('should stay in create mode when the API returns nothing', () => {
      bundleService.findOneById.mockReturnValue(of(null as unknown as Bundle));

      createComponent('unknown');

      expect(component.bundle).toBeUndefined();
    });
  });

  it('should create instead of update when no bundle is loaded', () => {
    createComponent(null);

    component.updateBundle(validValues as never);

    expect(bundleService.create).toHaveBeenCalled();
    expect(bundleService.update).not.toHaveBeenCalled();
  });
});
