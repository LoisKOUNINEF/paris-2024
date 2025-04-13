import { Component } from '@angular/core';
import { Contest, ContestComponent } from '../contest/contest.component';
import { CONTESTS } from '../contest/contests';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-landing-page',
  standalone: true,
  imports: [
    ContestComponent, 
    RouteButtonComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  contests: Array<Contest> = CONTESTS;
}
