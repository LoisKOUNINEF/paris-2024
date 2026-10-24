import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { User, UserDto, UserService } from '@paris-2024/client-data-access-user';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { SnackbarService } from '@paris-2024/client-utils';
import { EditUserComponent } from './edit-user.component';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let snackbarService: jest.Mocked<SnackbarService>;

  const currentUser = { id: 'user-1', email: 'test@test.com', firstName: 'Loïs', lastName: 'Test' } as User;

  beforeEach(async () => {
    userService = {
      findCurrentUser: jest.fn().mockReturnValue(of(currentUser)),
      update: jest.fn().mockReturnValue(of(currentUser)),
      delete: jest.fn().mockReturnValue(of(currentUser)),
    } as unknown as jest.Mocked<UserService>;

    authService = {
      logout: jest.fn().mockReturnValue(of({ msg: 'Logged out' })),
    } as unknown as jest.Mocked<AuthService>;

    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    snackbarService = {
      showSuccess: jest.fn().mockReturnValue({ afterDismissed: () => of(undefined) }),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [EditUserComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: SnackbarService, useValue: snackbarService },
      ],
    })
    .overrideComponent(EditUserComponent, { set: { imports: [], template: '' } })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the current user', () => {
    expect(userService.findCurrentUser).toHaveBeenCalled();
    expect(component.user).toEqual(currentUser);
  });

  describe('editInfos', () => {
    const formValue = { email: 'new@test.com', firstName: 'New', lastName: 'Name' };

    it('should update the user and go back to the user area', () => {
      component.editInfos(formValue);

      expect(userService.update).toHaveBeenCalledWith(new UserDto(formValue), 'user-1');
      expect(snackbarService.showSuccess).toHaveBeenCalledWith('Modifications enregistrées.');
      expect(router.navigate).toHaveBeenCalledWith(['/user']);
    });

    it('should stay on the page when the update fails', () => {
      userService.update.mockReturnValue(of(null as unknown as User));

      component.editInfos(formValue);

      expect(snackbarService.showSuccess).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('editPassword', () => {
    const formValue = { password: 'NewPassword1#' };

    it('should update the password and go back to the user area', () => {
      component.editPassword(formValue);

      expect(userService.update).toHaveBeenCalledWith(new UserDto(formValue), 'user-1');
      expect(snackbarService.showSuccess).toHaveBeenCalledWith('Mot de passe modifié.');
      expect(router.navigate).toHaveBeenCalledWith(['/user']);
    });

    it('should stay on the page when the update fails', () => {
      userService.update.mockReturnValue(of(null as unknown as User));

      component.editPassword(formValue);

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete the account, log out and go home', () => {
      component.delete();

      expect(userService.delete).toHaveBeenCalledWith('user-1');
      expect(snackbarService.showSuccess).toHaveBeenCalledWith('Compte suspendu.');
      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not log out when the deletion fails', () => {
      userService.delete.mockReturnValue(of(null as unknown as User));

      component.delete();

      expect(authService.logout).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
