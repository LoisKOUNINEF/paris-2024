import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDto } from './user.dto';
import { User } from './user.model';
import { ApiRequestService } from '@paris-2024/client-data-access-core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly userUrl = '/users';

  constructor(private apiRequestService: ApiRequestService) { }

  findAll(): Observable<Array<User>> {
    return this.apiRequestService.get<Array<User>>(this.userUrl);
  }

  findOneByEmail(email: User['email']): Observable<User> {
    return this.apiRequestService.get<User>(`${this.userUrl}?email=${email}`)
  }

  findOneById(id: User['id']): Observable<User> {
    return this.apiRequestService.get<User>(`${this.userUrl}/${id}`)
  }

  findCurrentUser(): Observable<User> {
    return this.apiRequestService.get<User>(`${this.userUrl}/current`)
  }

  update(userDto: UserDto, id: User['id']): Observable<User> {
    return this.apiRequestService.patch<User>(`${this.userUrl}/${id}`, userDto)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete(id: User['id']): Observable<any> {
    return this.apiRequestService.delete<User>(`${this.userUrl}/${id}`)
  }

  // Admin-protected backend URL
  createStaffUser(userDto: UserDto): Observable<User> {
    return this.apiRequestService.post<User>(this.userUrl, userDto)
  }
}