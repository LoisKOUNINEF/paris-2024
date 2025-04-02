import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

export type Contest = {
  name: string;
  date: Date;
  imageUrl?: string;
  details: string;
};

@Component({
  selector: 'lib-contest',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './contest.component.html',
  styleUrl: './contest.component.scss',
})
export class ContestComponent {
  @Input() contest: Contest = {
    name: '', 
    date: new Date(), 
    details: '',
    imageUrl: '',
  };
}
