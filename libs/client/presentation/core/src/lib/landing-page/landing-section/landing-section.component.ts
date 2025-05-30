import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface ILandingSection {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  content?: string;
  date?: Date;
}

@Component({
  selector: 'lib-landing-section',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
  ],
  templateUrl: './landing-section.component.html',
  styleUrl: './landing-section.component.scss',
})
export class LandingSectionComponent {
  imageUrl = 'assets/images/cheer.avif';
  imageAlt = 'Une basketteuse en fauteuil brandit un ballon devant la foule.';
  content = 'Pas de description disponible';

  @Input() section: ILandingSection;
  @Input() imagePosition: 'left' | 'right' = 'left';

}
