import { SortArrayPipe } from './sort-array.pipe';

describe('SortArrayPipe', () => {
  let pipe: SortArrayPipe;

  beforeEach(() => {
    pipe = new SortArrayPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty array when input is an empty array', () => {
    const result = pipe.transform([], 'prop');
    expect(result).toEqual([]);
  });

  it('should sort array of objects by the given property', () => {
    const array = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 28 },
    ];
    const sortedArray = pipe.transform(array, 'name');
    expect(sortedArray).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 28 },
      { name: 'Charlie', age: 30 },
    ]);
  });

  it('should sort array of numbers in ascending order', () => {
    const array = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const sortedArray = pipe.transform(array, 'value');
    expect(sortedArray).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });

  it('should handle sorting when properties are equal', () => {
    const array = [
      { name: 'Florie', age: 25 },
      { name: 'Florie', age: 30 },
      { name: 'Loïs', age: 28 },
    ];
    const sortedArray = pipe.transform(array, 'name');
    expect(sortedArray).toEqual([
      { name: 'Florie', age: 25 },
      { name: 'Florie', age: 30 },
      { name: 'Loïs', age: 28 },
    ]);
  });
});
