import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { UserService } from './user.service';
import { UserDto } from './user.dto';

jest.mock('@paris-2024/client-data-access-core');

describe('UsersService', () => {
  let service: UserService;
  let apiRequestService: jest.Mocked<ApiRequestService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, ApiRequestService]
    });

    service = TestBed.inject(UserService);
    apiRequestService = TestBed.inject(ApiRequestService) as jest.Mocked<ApiRequestService>;

    apiRequestService.get = jest.fn();
    apiRequestService.patch = jest.fn();
    apiRequestService.delete = jest.fn();
    apiRequestService.post = jest.fn();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should fetch all users', (done) => {
    const mockUsers = [{ id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' }];
    apiRequestService.get.mockReturnValue(of(mockUsers));

    service.findAll().subscribe(users => {
      expect(users).toEqual(mockUsers);
      done();
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/users');
  });

  it('should fetch a user by email', (done) => {
    const mockUser = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    apiRequestService.get.mockReturnValue(of(mockUser));

    service.findOneByEmail('test@example.com').subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/users?email=test@example.com');
  });

  it('should fetch a user by id', (done) => {
    const mockUser = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    apiRequestService.get.mockReturnValue(of(mockUser));

    service.findOneById('1').subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/users/1');
  });

  it('should fetch the current user', (done) => {
    const mockUser = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    apiRequestService.get.mockReturnValue(of(mockUser));

    service.findCurrentUser().subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/users/current');
  });

  it('should update a user', (done) => {
    const mockUser = { id: '1', email: 'test@example.com', firstName: 'Updated', lastName: 'User' };
    const mockUserDto: UserDto = { email: 'updated@example.com', firstName: 'Updated', lastName: 'User' };
    apiRequestService.patch.mockReturnValue(of(mockUser));

    service.update(mockUserDto, '1').subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });

    expect(apiRequestService.patch).toHaveBeenCalledWith('/users/1', mockUserDto);
  });

  it('should delete a user', (done) => {
    apiRequestService.delete.mockReturnValue(of({}));

    service.delete('1').subscribe(response => {
      expect(response).toEqual({});
      done();
    });

    expect(apiRequestService.delete).toHaveBeenCalledWith('/users/1');
  });

  it('should create a new staff user', (done) => {
    const mockUser = { id: '2', email: 'staff@example.com', firstName: 'New', lastName: 'Staff' };
    const mockUserDto: UserDto = { email: 'staff@example.com', firstName: 'New', lastName: 'Staff', password: 'password' };
    apiRequestService.post.mockReturnValue(of(mockUser));

    service.createStaffUser(mockUserDto).subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });

    expect(apiRequestService.post).toHaveBeenCalledWith('/users', mockUserDto);
  });
});
