import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CheckoutComponent } from './checkout.component';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let router: jest.Mocked<Router>;
  let queryParams: BehaviorSubject<Params>;

  beforeEach(async () => {
    queryParams = new BehaviorSubject<Params>({});
    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { queryParams } },
      ],
    })
    .overrideComponent(CheckoutComponent, { set: { imports: [], template: '' } })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
  });

  it('should read the total price from the query params', () => {
    queryParams.next({ total: '9650' });
    fixture.detectChanges();

    expect(component.totalPrice).toBe(9650);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should send the user back to the cart without a total', () => {
    fixture.detectChanges();

    expect(component.totalPrice).toBeUndefined();
    expect(router.navigate).toHaveBeenCalledWith(['shop/cart']);
  });
});
