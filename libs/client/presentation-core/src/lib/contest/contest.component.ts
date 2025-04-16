import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import * as Contests from './contests';

@Component({
  selector: 'lib-contest',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './contest.component.html',
  styleUrl: './contest.component.scss',
})
export class ContestComponent {
  imageUrl = 'assets/rings.avif';
  details = 'Pas de description disponible';

  @Input() contest: Contests.IContest = {
    name: '', 
    date: new Date(), 
    details: '',
    imageUrl: '',
    isParalympic: false,
  };
}
