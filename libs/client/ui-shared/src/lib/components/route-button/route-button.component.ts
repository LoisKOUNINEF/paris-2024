import { 
  Component, 
  ElementRef, 
  EventEmitter, 
  HostListener, 
  Input, 
  Output 
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-route-button',
  standalone: true,
  templateUrl: './route-button.component.html',
  styleUrl: './route-button.component.scss',
})
export class RouteButtonComponent {
  constructor(private router: Router, private elRef: ElementRef) {}

  @Input() content = '';
  @Input() path = '';
  @Output() buttonClicked = new EventEmitter;

  goToPage(): void {
    this.router.navigate([this.path]);
    this.buttonClicked.emit();
  }

  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  handleKeydown() {
    this.elRef.nativeElement.querySelector('button')?.click();
  }
}
