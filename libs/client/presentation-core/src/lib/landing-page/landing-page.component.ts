import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OlympicRingsComponent, RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { ILandingSection, LandingSectionComponent } from './landing-section/landing-section.component';
import { CONTESTS } from './landing-section/contests';

@Component({
  selector: 'lib-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouteButtonComponent,
    OlympicRingsComponent,
    LandingSectionComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  private defaultContent = 'Lorem, ipsum dolor sit amet consectetur adipisicing, elit. Necessitatibus corrupti dolores, numquam sunt impedit eos, quos quaerat amet sit saepe facilis. Repellat labore amet et, aliquid magnam sit iure minima! Error modi dolor quibusdam quod consequatur totam dicta, voluptatem, porro harum ut omnis veniam nihil, deserunt eligendi quasi mollitia rerum. ';

  contests = CONTESTS;

  sections: Array<ILandingSection> = [
    {
      title: 'La Compétition',
      imageUrl: 'assets/images/eiffel-rings.avif',
      imageAlt: 'Anneaux olympiques sur une place parisienne.',
      content: this.defaultContent,
    },
    {
      title: 'Pour Tous',
      imageUrl: 'assets/images/rings.avif',
      imageAlt: 'La tour Eiffel décorée des anneaux olympiques',
      content: this.defaultContent,
    },
    {
      title: 'Et encore plus',
      imageUrl: 'assets/images/eiffel-rings-sunset.avif',
      imageAlt: 'Coucher de soleil sur la tour Eiffel décorée des anneaux olympiques',
      content: this.defaultContent,
    }
  ]
}
