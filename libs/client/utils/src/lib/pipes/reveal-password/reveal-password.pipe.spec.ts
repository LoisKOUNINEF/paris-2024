import { RevealPasswordPipe } from './reveal-password.pipe';

describe('RevealPasswordPipe', () => {
  let pipe: RevealPasswordPipe;

  beforeEach(() => {
    pipe = new RevealPasswordPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "text" when isVisible is true', () => {
    const result = pipe.transform(true);
    expect(result).toBe("text");
  });

  it('should return "password" when isVisible is false', () => {
    const result = pipe.transform(false);
    expect(result).toBe("password");
  });
});
