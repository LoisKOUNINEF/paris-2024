import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cart, CartDto, CartFormValue, CartService } from '@paris-2024/client-data-access-cart';
import { SnackbarService } from '@paris-2024/client-utils';
import { Subscription } from 'rxjs';


@Component({
  selector: 'lib-modify-quantity',
  imports: [ReactiveFormsModule],
  templateUrl: './modify-quantity.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './modify-quantity.component.scss',
})
export class ModifyQuantityComponent implements OnInit, OnDestroy {
  @Output() quantityChanged = new EventEmitter<number>();
  subscription: Subscription = new Subscription;
  @Input({ required: true }) bundleId: string;
  @Input({ required: true }) quantity: number;
  quantityControl: FormControl;
  readonly MIN_QUANTITY = 0;
  readonly MAX_QUANTITY = 10;

  constructor(
    private cartService: CartService,
    private snackbarService: SnackbarService,
    ) {}

  ngOnInit() {
    this.quantityControl = new FormControl(this.quantity, [
      Validators.min(this.MIN_QUANTITY),
      Validators.max(this.MAX_QUANTITY),
    ]);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  updateQuantity(): void  {
    if (this.quantityControl.invalid) return;
    // an emptied input counts as 1, both for the server and the cart display
    const quantity: number = this.quantityControl.value ?? 1;
    const dto: CartDto = {
      quantity,
      bundleId: this.bundleId,
    };

    const cartDto = new CartDto(dto as CartFormValue);

    // ApiRequestService maps http errors to null
    this.subscription = this.cartService.updateQuantity(cartDto).subscribe((res: Cart) => {
      if (!res) {
        this.snackbarService.showError('Échec de la mise à jour.');
        return;
      }
      this.quantityChanged.emit(quantity)
      this.snackbarService.showInfo('Quantité mise à jour.');
    });
  }

  increaseQuantity(): void {
    const current = this.quantityControl.value || this.MIN_QUANTITY;
    if (current < this.MAX_QUANTITY) {
      this.quantityControl.setValue(current + 1);
    }
  }

  decreaseQuantity(): void {
    const current = this.quantityControl.value || this.MIN_QUANTITY;
    if (current > this.MIN_QUANTITY) {
      this.quantityControl.setValue(current - 1);
    }
  }

  isButtonDisabled(): boolean {
    return this.quantityControl.invalid || this.quantityControl.value === this.quantity;
  }

  isRemoveButton(): boolean {
    if(this.quantityControl.value && this.quantityControl.value > this.MIN_QUANTITY){
      return false;
    }
    return true;
  }
}
