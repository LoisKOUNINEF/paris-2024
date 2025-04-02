/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, signal } from '@angular/core';
import { Observable, filter, forkJoin, map } from 'rxjs';
import { User, UserDto } from '@paris-2024/client-data-access-user';
import { ApiRequestService } from '@paris-2024/client-data-access-core';

interface IAuthStatus {
  isAuth: boolean; 
  isStaff: boolean; 
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = '/auth';
  private readonly statusUrl = this.authUrl + '/status';
  private readonly signupUrl = this.authUrl + '/signup';
  private readonly loginUrl = this.authUrl + '/login';
  private readonly logoutUrl = this.authUrl + '/logout';
  private readonly pwdResetUrl = this.authUrl + '/password-reset';
  private readonly checkAuthUrl = this.statusUrl + '/is-authenticated';
  private readonly checkStaffUrl = this.statusUrl + '/is-staff';
  private readonly checkAdminUrl = this.statusUrl + '/is-admin';
  
  public isAuth = signal(false);
  public isStaff = signal(false);
  public isAdmin = signal(false);

  constructor( private apiRequestService: ApiRequestService ) { }

  public signup(userDto: UserDto): Observable<User> {
    return this.apiRequestService
      .post<User>(this.signupUrl, userDto);
  }

  public login(userDto: UserDto): Observable<User> {
    return this.apiRequestService
      .post<User>(this.loginUrl, userDto)
      .pipe(
      filter(res => !!res),
      map((response: any) => {
        if(response.role === 'admin') {
          this.isAdmin.set(true);
        }
        this.isAuth.set(true);
        return response;
      })
    );
  }

  public logout(): Observable<any> {
    return this.apiRequestService
      .post<any>(this.logoutUrl)
      .pipe(
        filter(res => !!res),
        map((response: any) => {
          this.isAdmin.set(false);
          this.isStaff.set(false);
          this.isAuth.set(false);
          return response;
        })
      )
  }

  public checkUserStatus(): Observable<IAuthStatus> {
    return forkJoin({
      isAuth: this.checkAuthStatus(),
      isStaff: this.checkStaffStatus(),
      isAdmin: this.checkAdminStatus()
    }).pipe(
        map(({ isAuth, isStaff, isAdmin }) => {
          this.isAuth.set(isAuth);
          this.isStaff.set(isStaff);
          this.isAdmin.set(isAdmin);
          return { isAuth, isStaff, isAdmin };
      })
    );
  }

  public sendPwdResetLink(userDto: UserDto): Observable<any> {
    return this.apiRequestService
      .post<User>(this.pwdResetUrl, userDto);
  }

  public resetPwd(userDto: UserDto, token: string): Observable<any> {
    return this.apiRequestService
      .post<Partial<User>>(`${this.pwdResetUrl}?token=${token}`, userDto);
  }

  private checkAuthStatus(): Observable<boolean> {
    return this.apiRequestService
      .get<boolean>(this.checkAuthUrl)
      .pipe(
        map(res => {
        const isAuthenticated = !!res;
        return isAuthenticated;
      })
    );
  }

  private checkStaffStatus(): Observable<boolean> {
    return this.apiRequestService
      .get<boolean>(this.checkStaffUrl)
      .pipe(
        map(res => {
        const isStaff = !!res;
        return isStaff;
      })
    );
  }

  private checkAdminStatus(): Observable<boolean> {
    return this.apiRequestService
      .get<boolean>(this.checkAdminUrl)
      .pipe(
        map(res => {
        const isAdmin = !!res;
        return isAdmin;
      })
    );
  }
}