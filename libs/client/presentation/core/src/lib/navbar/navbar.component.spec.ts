import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;
  let authService: AuthService;

  const routerMock = {
    navigate: jest.fn()
  };

  const authServiceMock = {
    isAdmin: jest.fn(),
    isAuth: jest.fn(),
    checkAdminStatus: jest.fn(),
    checkAuthStatus: jest.fn(),
    logout: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouteButtonComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize auth', () => {
      fixture.detectChanges();
      expect(component.auth).toBe(authService);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      authServiceMock.logout.mockReturnValue(of(void 0));
    });

    it('should call auth service logout and navigate to home', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });

  describe('template rendering - admin user', () => {
    beforeEach(() => {
      authServiceMock.isAdmin.mockReturnValue(true);
      authServiceMock.isAuth.mockReturnValue(true);
      fixture.detectChanges();
    });

    it('should show admin dashboard button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('lib-route-button');
      const adminButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Dashboard Administrateur');
      expect(adminButton).toBeTruthy();
    });

    it('should not show shop buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('lib-route-button');
      const shopButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Aller à la boutique');
      expect(shopButton).toBeFalsy();
    });
  });

  describe('template rendering - authenticated non-admin user', () => {
    beforeEach(() => {
      authServiceMock.isAdmin.mockReturnValue(false);
      authServiceMock.isAuth.mockReturnValue(true);
      fixture.detectChanges();
    });

    it('should show home, shop, cart, account and logout buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('lib-route-button');
      expect(buttons.length).toBe(4);
      
      const homeButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Accueil');
      const shopButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Aller à la boutique');
      const cartButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Mon Panier');
      const accountButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Mon Compte');
      const logoutButton = fixture.nativeElement.querySelector('button');;
      
      expect(homeButton).toBeTruthy();
      expect(shopButton).toBeTruthy();
      expect(cartButton).toBeTruthy();
      expect(accountButton).toBeTruthy();
      expect(logoutButton).toBeTruthy();
    });
  });

  describe('template rendering - unauthenticated user', () => {
    beforeEach(() => {
      authServiceMock.isAdmin.mockReturnValue(false);
      authServiceMock.isAuth.mockReturnValue(false);
      fixture.detectChanges();
    });

    it('should show home, shop, cart and auth buttons, and not show logout button nor account button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('lib-route-button');
      expect(buttons.length).toBe(5);
      
      const homeButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Accueil');
      const shopButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Aller à la boutique');
      const loginButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Se Connecter');
      const signupButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Créer un compte');
      const accountButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Mon Compte');
      const logoutButton = Array.from(buttons)
        .find((button: any) => button.getAttribute('content') === 'Se déconnecter');
      
      expect(homeButton).toBeTruthy();
      expect(shopButton).toBeTruthy();
      expect(loginButton).toBeTruthy();
      expect(signupButton).toBeTruthy();
      expect(accountButton).toBeFalsy();
      expect(logoutButton).toBeFalsy();
    });
  });
});