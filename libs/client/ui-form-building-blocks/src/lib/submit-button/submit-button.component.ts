import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-submit-button',
  standalone: true,
  templateUrl: './submit-button.component.html',
  styleUrl: './submit-button.component.scss',
})
export class SubmitButtonComponent {
  @Input() content = 'Valider';
  @Input() isDisabled = false;
}
