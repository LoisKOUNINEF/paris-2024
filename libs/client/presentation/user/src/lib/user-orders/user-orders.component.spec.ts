import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { OrderService } from '@paris-2024/client-data-access-order';
import { IOrderEntity } from '@paris-2024/shared-interfaces';
import { UserOrdersComponent } from './user-orders.component';

describe('UserOrdersComponent', () => {
  let component: UserOrdersComponent;
  let fixture: ComponentFixture<UserOrdersComponent>;
  let router: jest.Mocked<Router>;

  const orders = [{ id: 'order-1' }, { id: 'order-2' }] as IOrderEntity[];

  beforeEach(async () => {
    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [UserOrdersComponent],
      providers: [
        { provide: OrderService, useValue: { findUserOrders: jest.fn().mockReturnValue(of(orders)) } },
        { provide: Router, useValue: router },
      ],
    })
    .overrideComponent(UserOrdersComponent, { set: { imports: [], template: '' } })
    .compileComponents();

    fixture = TestBed.createComponent(UserOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the user orders', () => {
    expect(component.orders).toEqual(orders);
  });

  it('should open the order details', () => {
    component.goToDetails('order-1');

    expect(router.navigate).toHaveBeenCalledWith(['/shop/order/order-1']);
  });
});
