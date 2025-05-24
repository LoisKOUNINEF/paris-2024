import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, of } from "rxjs";

@Injectable({ providedIn: 'root'})
export class ApiRequestService {

  private readonly apiUrl = 
    process.env['NODE_ENV'] === 'development' 
    ? 'http://localhost:8080/api' 
    : '/api';

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true
  };

  constructor(
    private http: HttpClient, 
    ) { }

  private formatErrors(error: Error, errorValue: any) {
    console.error(error);
    return of(errorValue);
  }

  get<T>(path: string): Observable<T> {
    return this.http
    .get<T>(`${this.apiUrl}${path}`, 
      this.httpOptions)
      .pipe(catchError((error) => this.formatErrors(error, null)));
  }

  patch<T>(path: string, body: object = {}): Observable<T> {
    return this.http
    .patch<T>(`${this.apiUrl}${path}`,
      JSON.stringify(body),
      this.httpOptions)
      .pipe(catchError((error) => this.formatErrors(error, null)));
  }

  post<T>(path: string, body: object = {}): Observable<T> {
    return this.http
    .post<T>(`${this.apiUrl}${path}`,
      JSON.stringify(body),
      this.httpOptions)
      .pipe(catchError((error) => this.formatErrors(error, null)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
    .delete<T>(`${this.apiUrl}${path}`, 
      this.httpOptions)
      .pipe(catchError((error) => this.formatErrors(error, null)));
  }
}
