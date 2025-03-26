import { MockType } from './mock.type';

describe('MockType', () => {
  interface TestInterface {
    method1(): string;
    method2(param: number): boolean;
    property1: string;
  }

  it('should create a mock object with jest.Mock properties', () => {
    const mock: MockType<TestInterface> = {
      method1: jest.fn(),
      method2: jest.fn(),
      property1: jest.fn()
    };

    expect(jest.isMockFunction(mock.method1)).toBeTruthy();
    expect(jest.isMockFunction(mock.method2)).toBeTruthy();
    expect(jest.isMockFunction(mock.property1)).toBeTruthy();
  });

  it('should allow partial implementation of the interface', () => {
    const partialMock: MockType<TestInterface> = {
      method1: jest.fn()
    };

    expect(jest.isMockFunction(partialMock.method1)).toBeTruthy();
    expect(partialMock.method2).toBeUndefined();
    expect(partialMock.property1).toBeUndefined();
  });

  it('should allow mock methods to return values', () => {
    const mock: MockType<TestInterface> = {
      method1: jest.fn().mockReturnValue('mocked string'),
      method2: jest.fn().mockReturnValue(true)
    };
    if (mock.method1 && mock.method2) {
      expect(mock.method1()).toBe('mocked string');
      expect(mock.method2(123)).toBe(true);
    }
  });
});