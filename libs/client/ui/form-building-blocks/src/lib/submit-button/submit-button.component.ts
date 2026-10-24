import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'lib-submit-button',
  standalone: true,
  templateUrl: './submit-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './submit-button.component.scss',
})
export class SubmitButtonComponent {
  @Input() content = 'Valider';
  @Input() isDisabled = false;
}
