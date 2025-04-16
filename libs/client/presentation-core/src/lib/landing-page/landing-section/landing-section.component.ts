import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ILandingSection {
  title: string;
  imageUrl: string;
  imageAlt: string;
  content: string;
}

@Component({
  selector: 'lib-landing-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-section.component.html',
  styleUrl: './landing-section.component.scss',
})
export class LandingSectionComponent {
  @Input() section: ILandingSection;
  @Input() imagePosition: 'left' | 'right' = 'left';

}
