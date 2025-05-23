import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BundleCardComponent } from './bundle-card.component';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { Bundle } from '@paris-2024/client-data-access-bundle';

describe('BundleCardComponent', () => {
  let component: BundleCardComponent;
  let fixture: ComponentFixture<BundleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
      	BundleCardComponent, 
      	CommonModule, 
      	CurrencyPipe, 
      	FormatPricePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BundleCardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display bundle details correctly', () => {
    const mockBundle: Bundle = {
      name: 'Solo',
      price: 150
    } as unknown as Bundle;

    component.bundle = mockBundle;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Solo');
  });
});
