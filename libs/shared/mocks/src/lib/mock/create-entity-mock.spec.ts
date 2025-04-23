import { createEntityMock } from './create-entity-mock';

class TestEntity {
  id!: string;
  firstName!: string;
  lastName!: string;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  set fullName(value: string) {
    const [first, last] = value.split(' ');
    this.firstName = first;
    this.lastName = last;
  }

  greet() {
    return `Hello, ${this.firstName}`;
  }
}

describe('createEntityMock', () => {
  it('should create a mock entity with jest.fn() for methods', () => {
    const { mockEntity } = createEntityMock(TestEntity);

    expect(mockEntity.greet).toBeDefined();
    expect(typeof mockEntity.greet).toBe('function');
    expect(mockEntity.greet).toHaveProperty('mock');
  });

  it('should mock getters and setters separately', () => {
    const { mockEntity } = createEntityMock(TestEntity);

    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(mockEntity), 
      'fullName'
    )    
    expect(descriptor).toBeDefined();
    expect(descriptor?.get).toHaveProperty('mock');
    expect(descriptor?.set).toHaveProperty('mock');
  });

  it('should return a mock object with default values', () => {
    const defaultValues = {
      id: 'test-id',
      firstName: 'John',
      lastName: 'Doe',
    };

    const { createMock } = createEntityMock(TestEntity, defaultValues);
    const mockInstance = createMock();

    expect(mockInstance.id).toBe('test-id');
    expect(mockInstance.firstName).toBe('John');
    expect(mockInstance.lastName).toBe('Doe');
  });

  it('should allow overriding default values', () => {
    const defaultValues = {
      id: 'test-id',
      firstName: 'John',
      lastName: 'Doe',
    };

    const { createMock } = createEntityMock(TestEntity, defaultValues);
    const mockInstance = createMock({ firstName: 'Jane' });

    expect(mockInstance.id).toBe('test-id'); // Unchanged default
    expect(mockInstance.firstName).toBe('Jane'); // Overridden value
    expect(mockInstance.lastName).toBe('Doe'); // Unchanged default
  });
});
