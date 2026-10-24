import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { PlatformService } from '@paris-2024/client-utils';
import { VerifyEmailComponent } from './verify-email.component';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let platformService: { isBrowser: boolean };

  const createComponent = (params: Params) => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { params } } });
    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const text = () => fixture.nativeElement.textContent;

  beforeEach(async () => {
    platformService = { isBrowser: true };
    authService = {
      verifyEmail: jest.fn().mockReturnValue(of(true)),
    } as unknown as jest.Mocked<AuthService>;

    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [VerifyEmailComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: PlatformService, useValue: platformService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should confirm a valid token', () => {
    createComponent({ token: 'valid-token' });

    expect(authService.verifyEmail).toHaveBeenCalledWith('valid-token');
    expect(component.loading).toBe(false);
    expect(component.success).toBe('Email validé !');
    expect(component.error).toBeNull();
    expect(text()).toContain('Email validé !');
  });

  it.each([false, null])('should show an error when the API returns %p', (response) => {
    authService.verifyEmail.mockReturnValue(of(response as boolean));
    createComponent({ token: 'invalid-token' });

    expect(component.loading).toBe(false);
    expect(component.success).toBeNull();
    expect(component.error).toBe('Lien de vérification invalide');
    expect(text()).toContain('Lien de vérification invalide');
  });

  it('should show an error without calling the API when the token is missing', () => {
    createComponent({});

    expect(authService.verifyEmail).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Lien de vérification invalide');
  });

  it('should not verify on the server', () => {
    platformService.isBrowser = false;
    createComponent({ token: 'valid-token' });

    expect(authService.verifyEmail).not.toHaveBeenCalled();
    expect(component.loading).toBe(true);
  });

  it('should go to login from the success message', () => {
    createComponent({ token: 'valid-token' });

    fixture.nativeElement.querySelector('a').click();

    expect(router.navigate).toHaveBeenCalledWith(['auth/login']);
  });
});
