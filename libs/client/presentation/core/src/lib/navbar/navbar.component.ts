import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'lib-navbar',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouteButtonComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  auth: AuthService;

  constructor(
    private router: Router, 
    private authService: AuthService,
    ) {}

  ngOnInit(): void {
    this.auth = this.authService;
  }

  logout() {
    return this.authService.logout()
      .subscribe(() => this.router.navigate(['']))
  }
}
