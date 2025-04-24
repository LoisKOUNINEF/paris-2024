import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Cart, CartDto, CartFormValue, CartService } from '@paris-2024/client-data-access-cart';
import { SnackbarService } from '@paris-2024/client-utils';
import { Subscription } from 'rxjs';


@Component({
  selector: 'lib-modify-quantity',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modify-quantity.component.html',
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
    this.quantityControl = new FormControl(this.quantity);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  updateQuantity(): void  {
    const dto: CartDto = {
      quantity: this.quantityControl.value ?? 1,
      bundleId: this.bundleId,
    };

    const cartDto = new CartDto(dto as CartFormValue);

    this.subscription = this.cartService.updateQuantity(cartDto).subscribe({
      next: (res: Cart) => {
        this.quantityChanged.emit(this.quantityControl.value)
        this.snackbarService.showInfo('Quantité mise à jour.');
      },
      error: () => this.snackbarService.showError('Échec de la mise à jour.')
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
    if (this.quantityControl.value && this.quantityControl.value !== this.quantity) {
      return false;
    }
    return true;
  }

  isRemoveButton(): boolean {
    if(this.quantityControl.value && this.quantityControl.value > this.MIN_QUANTITY){
      return false;
    }
    return true;
  }
}
