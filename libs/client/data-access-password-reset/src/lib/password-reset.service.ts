/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserDto } from '@paris-2024/client-data-access-user';
import { ApiRequestService } from '@paris-2024/client-data-access-core';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private readonly pwdResetUrl = '/password-reset';

  constructor( private apiRequestService: ApiRequestService ) { }

  public sendPwdResetLink(userDto: UserDto): Observable<any> {
    return this.apiRequestService
      .post<User>(this.pwdResetUrl, userDto);
  }

  public resetPwd(userDto: UserDto, token: string): Observable<any> {
    return this.apiRequestService
      .post<Partial<User>>(`${this.pwdResetUrl}?token=${token}`, userDto);
  }
}