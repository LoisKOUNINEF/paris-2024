import { FormatPricePipe } from './format-price.pipe';

describe('FormatPricePipe', () => {
  let pipe: FormatPricePipe;

  beforeEach(() => {
    pipe = new FormatPricePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format the price correctly by dividing by 100', () => {
    const price = 5000;
    const formattedPrice = pipe.transform(price);
    expect(formattedPrice).toBe(50);
  });

  it('should return 0 for 0 input', () => {
    const price = 0;
    const formattedPrice = pipe.transform(price);
    expect(formattedPrice).toBe(0);
  });

  it('should handle negative values correctly', () => {
    const price = -3000;
    const formattedPrice = pipe.transform(price);
    expect(formattedPrice).toBe(0);
  });

  it('should return fractional values when applicable', () => {
    const price = 2999;
    const formattedPrice = pipe.transform(price);
    expect(formattedPrice).toBe(29.99);
  });
});
