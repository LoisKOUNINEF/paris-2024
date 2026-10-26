import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortArray',
  standalone: true
})
export class SortArrayPipe implements PipeTransform {
  transform<T>(array: Array<T> | null | undefined, prop: keyof T): Array<T> {
    if (!array?.length) return array ?? [];
    return array.sort((a: T, b: T) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }
}
