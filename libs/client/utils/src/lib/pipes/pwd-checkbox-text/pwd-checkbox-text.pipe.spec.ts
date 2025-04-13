import { PwdCheckboxTextPipe } from './pwd-checkbox-text.pipe';

describe('PwdCheckboxTextPipe', () => {
  let pipe: PwdCheckboxTextPipe;

  beforeEach(() => {
    pipe = new PwdCheckboxTextPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Cacher le mot de passe" when isVisible is true', () => {
    const result = pipe.transform(true);
    expect(result).toBe("Cacher le mot de passe");
  });

  it('should return "Montrer le mot de passe" when isVisible is false', () => {
    const result = pipe.transform(false);
    expect(result).toBe("Montrer le mot de passe");
  });
});
