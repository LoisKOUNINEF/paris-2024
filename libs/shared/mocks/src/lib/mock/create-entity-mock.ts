import { MockType } from "./mock.type";

export function createEntityMock<T>(
  entityClass: { new (): T },
  defaultValues: Partial<T> = {}
): { 
  mockEntity: MockType<T>; 
  createMock: (overrides?: Partial<T>) => T 
  } {
  class MockEntity {}

  Object.getOwnPropertyNames(entityClass.prototype).forEach((key) => {
    if (key !== 'constructor') {
      const descriptor = Object.getOwnPropertyDescriptor(entityClass.prototype, key);
      
      if (descriptor) {
        if (typeof descriptor.value === 'function') {
          (MockEntity.prototype as any)[key] = jest.fn();
        } else {
          Object.defineProperty(MockEntity.prototype, key, {
            get: descriptor.get ? jest.fn() : undefined,
            set: descriptor.set ? jest.fn() : undefined,
            configurable: true,
            enumerable: true,
          });
        }
      }
    }
  });

  const mockEntity = new MockEntity() as MockType<T>;

  Object.keys(defaultValues).forEach((key) => {
    (mockEntity as any)[key] = defaultValues[key as keyof T];
  });

  const createMock = (overrides: Partial<T> = {}): T => ({
    ...defaultValues,
    ...overrides,
  }) as T;

  return { mockEntity, createMock };
}
