import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { OrderService } from '@paris-2024/client-data-access-order';
import { IOrderEntity } from '@paris-2024/shared-interfaces';
import { PlatformService } from '@paris-2024/client-utils';
import { UserOrdersComponent } from './user-orders.component';

describe('UserOrdersComponent', () => {
  let component: UserOrdersComponent;
  let fixture: ComponentFixture<UserOrdersComponent>;
  let router: jest.Mocked<Router>;
  let platformService: { isBrowser: boolean };

  const orders = [{ id: 'order-1' }, { id: 'order-2' }] as IOrderEntity[];

  beforeEach(async () => {
    platformService = { isBrowser: true };
    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [UserOrdersComponent],
      providers: [
        { provide: OrderService, useValue: { findUserOrders: jest.fn().mockReturnValue(of(orders)) } },
        { provide: Router, useValue: router },
        { provide: PlatformService, useValue: platformService },
      ],
    })
    .overrideComponent(UserOrdersComponent, { set: { imports: [], template: '' } })
    .compileComponents();

    fixture = TestBed.createComponent(UserOrdersComponent);
    component = fixture.componentInstance;
  });

  it('should load the user orders', () => {
    fixture.detectChanges();
    expect(component.orders).toEqual(orders);
  });

  it('should open the order details', () => {
    component.goToDetails('order-1');

    expect(router.navigate).toHaveBeenCalledWith(['/shop/order/order-1']);
  });

  it('should not load the orders on the server', () => {
    platformService.isBrowser = false;
    fixture.detectChanges();

    expect(TestBed.inject(OrderService).findUserOrders).not.toHaveBeenCalled();
  });
});
