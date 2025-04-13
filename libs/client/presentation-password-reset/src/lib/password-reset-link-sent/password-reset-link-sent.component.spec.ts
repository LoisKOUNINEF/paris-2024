import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';
import { PasswordResetLinkSentComponent } from './password-reset-link-sent.component';

describe('PasswordResetLinkSentComponent', () => {
  let component: PasswordResetLinkSentComponent;
  let fixture: ComponentFixture<PasswordResetLinkSentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouteButtonComponent,
        PasswordResetLinkSentComponent,
      ]
    });

    fixture = TestBed.createComponent(PasswordResetLinkSentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct message', () => {
    fixture.detectChanges();

    const messageElement = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(messageElement.textContent).toContain('Si un compte existe avec cette adresse e-mail, un lien de réinitialisation vous a été envoyé.');
  });

  it('should have a "Se connecter" button that navigates to the "auth/login" path', () => {
    fixture.detectChanges();

    const routeButtonComponent = fixture.debugElement.query(By.directive(RouteButtonComponent)).componentInstance;
    expect(routeButtonComponent.content).toBe('Se connecter');
    expect(routeButtonComponent.path).toBe('auth/login');
  });
});