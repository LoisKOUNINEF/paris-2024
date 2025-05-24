import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-olympic-rings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './olympic-rings.component.html',
  styleUrl: './olympic-rings.component.scss',
})
export class OlympicRingsComponent {
  @Input() height = '30vh';
  @Input() width = '100%';
}
