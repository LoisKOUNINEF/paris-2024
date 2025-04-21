import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OlympicRingsComponent, RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { LandingSectionComponent } from './landing-section/landing-section.component';
import { CONTESTS } from './contests';
import { LANDING_ELEMENTS } from './landing-elements';

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

  contests = CONTESTS;
  sections = LANDING_ELEMENTS;
}
