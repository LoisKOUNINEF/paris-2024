import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OlympicRingsComponent, RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { LandingSectionComponent } from './landing-section/landing-section.component';
import { CONTESTS } from './contests';
import { LANDING_ELEMENTS } from './landing-elements';

@Component({
  selector: 'lib-landing-page',
  imports: [
    RouteButtonComponent,
    OlympicRingsComponent,
    LandingSectionComponent,
  ],
  templateUrl: './landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {

  contests = CONTESTS;
  sections = LANDING_ELEMENTS;
}
