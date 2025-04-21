import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'revealPassword',
  standalone: true
})
export class RevealPasswordPipe implements PipeTransform {
  transform(isVisible: boolean): string {
    if (isVisible) {
      return "text";
    }
    return "password";
  }
}
