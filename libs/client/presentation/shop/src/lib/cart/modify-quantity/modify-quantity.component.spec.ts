import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Cart, CartService } from '@paris-2024/client-data-access-cart';
import { SnackbarService } from '@paris-2024/client-utils';
import { ModifyQuantityComponent } from './modify-quantity.component';

describe('ModifyQuantityComponent', () => {
  let component: ModifyQuantityComponent;
  let fixture: ComponentFixture<ModifyQuantityComponent>;
  let cartService: jest.Mocked<CartService>;
  let snackbarService: jest.Mocked<SnackbarService>;

  beforeEach(async () => {
    cartService = {
      updateQuantity: jest.fn(),
    } as unknown as jest.Mocked<CartService>;

    snackbarService = {
      showInfo: jest.fn(),
      showError: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [ModifyQuantityComponent],
      providers: [
        { provide: CartService, useValue: cartService },
        { provide: SnackbarService, useValue: snackbarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyQuantityComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bundleId', 'bundle-1');
    fixture.componentRef.setInput('quantity', 2);
    fixture.detectChanges();
  });

  it('should initialise the control with the current quantity', () => {
    expect(component.quantityControl.value).toBe(2);
  });

  describe('increaseQuantity / decreaseQuantity', () => {
    it('should increase and decrease by one', () => {
      component.increaseQuantity();
      expect(component.quantityControl.value).toBe(3);

      component.decreaseQuantity();
      component.decreaseQuantity();
      expect(component.quantityControl.value).toBe(1);
    });

    it('should not go above the maximum', () => {
      component.quantityControl.setValue(component.MAX_QUANTITY);
      component.increaseQuantity();
      expect(component.quantityControl.value).toBe(component.MAX_QUANTITY);
    });

    it('should not go below the minimum', () => {
      component.quantityControl.setValue(component.MIN_QUANTITY);
      component.decreaseQuantity();
      expect(component.quantityControl.value).toBe(component.MIN_QUANTITY);
    });

    it('should treat an empty input as the minimum', () => {
      component.quantityControl.setValue(null);
      component.increaseQuantity();
      expect(component.quantityControl.value).toBe(1);
    });
  });

  describe('button state', () => {
    it('should disable the update button while the quantity is unchanged', () => {
      expect(component.isButtonDisabled()).toBe(true);

      component.quantityControl.setValue(3);
      expect(component.isButtonDisabled()).toBe(false);
    });

    it('should enable the update button to remove the bundle at zero', () => {
      component.quantityControl.setValue(0);
      expect(component.isButtonDisabled()).toBe(false);
    });

    it('should disable the update button above the maximum', () => {
      component.quantityControl.setValue(component.MAX_QUANTITY + 1);
      expect(component.isButtonDisabled()).toBe(true);
    });

    it('should switch to a remove button at zero', () => {
      expect(component.isRemoveButton()).toBe(false);

      component.quantityControl.setValue(0);
      expect(component.isRemoveButton()).toBe(true);
    });
  });

  describe('updateQuantity', () => {
    it('should send the new quantity, emit it and notify the user', () => {
      cartService.updateQuantity.mockReturnValue(of({ bundles: [] } as unknown as Cart));
      const emitSpy = jest.spyOn(component.quantityChanged, 'emit');
      component.quantityControl.setValue(5);

      component.updateQuantity();

      expect(cartService.updateQuantity).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 5, bundleId: 'bundle-1' })
      );
      expect(emitSpy).toHaveBeenCalledWith(5);
      expect(snackbarService.showInfo).toHaveBeenCalledWith('Quantité mise à jour.');
    });

    it('should send a zero quantity to remove the bundle', () => {
      cartService.updateQuantity.mockReturnValue(of({ bundles: [] } as unknown as Cart));
      component.quantityControl.setValue(0);

      component.updateQuantity();

      expect(cartService.updateQuantity).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 0 })
      );
    });

    it('should not emit and show an error when the API returns nothing', () => {
      cartService.updateQuantity.mockReturnValue(of(null as unknown as Cart));
      const emitSpy = jest.spyOn(component.quantityChanged, 'emit');
      component.quantityControl.setValue(5);

      component.updateQuantity();

      expect(emitSpy).not.toHaveBeenCalled();
      expect(snackbarService.showInfo).not.toHaveBeenCalled();
      expect(snackbarService.showError).toHaveBeenCalledWith('Échec de la mise à jour.');
    });

    it('should send and emit 1 when the input is emptied', () => {
      cartService.updateQuantity.mockReturnValue(of({ bundles: [] } as unknown as Cart));
      const emitSpy = jest.spyOn(component.quantityChanged, 'emit');
      component.quantityControl.setValue(null);

      component.updateQuantity();

      expect(cartService.updateQuantity).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 1 })
      );
      expect(emitSpy).toHaveBeenCalledWith(1);
    });

    it('should not send a quantity above the maximum', () => {
      component.quantityControl.setValue(component.MAX_QUANTITY + 1);

      component.updateQuantity();

      expect(cartService.updateQuantity).not.toHaveBeenCalled();
    });
  });
});
