import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CheckoutComponent } from './checkout.component';

@Component({ selector: 'lib-payment', template: '' })
class PaymentStubComponent {}

describe('CheckoutComponent', () => {
  let fixture: ComponentFixture<CheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
    })
    .overrideComponent(CheckoutComponent, { set: { imports: [PaymentStubComponent] } })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();
  });

  it('should render the payment form without passing any amount', () => {
    const payment = fixture.nativeElement.querySelector('lib-payment');

    expect(payment).not.toBeNull();
    expect(payment.attributes.length).toBe(0);
  });
});
