import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-olympic-rings',
  imports: [CommonModule],
  templateUrl: './olympic-rings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './olympic-rings.component.scss',
})
export class OlympicRingsComponent {
  @Input() height = '30vh';
  @Input() width = '100%';
}
