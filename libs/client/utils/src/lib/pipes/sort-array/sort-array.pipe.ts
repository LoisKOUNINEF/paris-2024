import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortArray',
  standalone: true
})
export class SortArrayPipe implements PipeTransform {
  transform<T>(array: Array<T>, prop: keyof T): Array<T> {
    if(array.length === 0) return array;
    return array.sort((a: T, b: T) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }
}
