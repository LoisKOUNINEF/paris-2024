import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pwdCheckboxText',
  standalone: true
})
export class PwdCheckboxTextPipe implements PipeTransform {
  transform(isVisible: boolean): string {    
    if (isVisible) {
      return "Cacher le mot de passe";
    }
    return "Montrer le mot de passe";
  }
}
