import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateStaffComponent } from './create-staff.component';
import { FullUserFormComponent } from '@paris-2024/client-ui-forms';
import { UserService } from '@paris-2024/client-data-access-user';
import { SnackbarService } from '@paris-2024/client-utils';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserDto } from '@paris-2024/client-data-access-user';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateStaffComponent', () => {
  let component: CreateStaffComponent;
  let fixture: ComponentFixture<CreateStaffComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let snackbarService: jest.Mocked<SnackbarService>;

  const mockUserFormValue = {
    email: 'staff@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password'
  };

  beforeEach(async () => {
    const userServiceMock = {
      createStaffUser: jest.fn().mockReturnValue(of({ id: '123', ...mockUserFormValue } as User)),
    };

    const snackbarServiceMock = {
      showSuccess: jest.fn().mockReturnValue({ afterDismissed: () => of(true) })
    };

    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
      	CreateStaffComponent, 
      	FullUserFormComponent,
      	NoopAnimationsModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: SnackbarService, useValue: snackbarServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateStaffComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    snackbarService = TestBed.inject(SnackbarService) as jest.Mocked<SnackbarService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call userService.createStaffUser and navigate on success', () => {
    component.createStaff(mockUserFormValue);

    expect(userService.createStaffUser).toHaveBeenCalledWith(new UserDto(mockUserFormValue));
    expect(snackbarService.showSuccess).toHaveBeenCalledWith('Membre du staff ajouté.');
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should unsubscribe on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
