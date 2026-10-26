import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { OrderService } from '@paris-2024/client-data-access-order';
import { PlatformService } from '@paris-2024/client-utils';
import { IOrderTickets } from '@paris-2024/shared-interfaces';
import { OrderDetailsComponent } from './order-details.component';

describe('OrderDetailsComponent', () => {
  let fixture: ComponentFixture<OrderDetailsComponent>;
  let orderService: jest.Mocked<OrderService>;
  let platformService: { isBrowser: boolean };

  const orderTickets = {
    orderId: 'order-1',
    totalPrice: 4200,
    tickets: [{ qrCode: 'data:image/png;base64,a' }, { qrCode: 'data:image/png;base64,b' }],
  } as unknown as IOrderTickets;

  const createComponent = (orderId: string | null) => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap(orderId ? { id: orderId } : {}) } },
    });
    fixture = TestBed.createComponent(OrderDetailsComponent);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    platformService = { isBrowser: true };
    orderService = {
      findOne: jest.fn().mockReturnValue(of(orderTickets)),
    } as unknown as jest.Mocked<OrderService>;

    await TestBed.configureTestingModule({
      imports: [OrderDetailsComponent],
      providers: [
        { provide: OrderService, useValue: orderService },
        { provide: PlatformService, useValue: platformService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should load the order and display one QR code per ticket', () => {
    createComponent('order-1');

    expect(orderService.findOne).toHaveBeenCalledWith('order-1');
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('order-1');
    expect(fixture.nativeElement.querySelectorAll('.ticket img')).toHaveLength(2);
  });

  it('should show a not found message when the order cannot be loaded', () => {
    orderService.findOne.mockReturnValue(of(null as unknown as IOrderTickets));
    createComponent('order-1');

    expect(fixture.nativeElement.querySelector('.not-found')).toBeTruthy();
  });

  it('should not request an order without an id', () => {
    createComponent(null);

    expect(orderService.findOne).not.toHaveBeenCalled();
  });

  it('should not request the order on the server', () => {
    platformService.isBrowser = false;
    createComponent('order-1');

    expect(orderService.findOne).not.toHaveBeenCalled();
  });
});
