import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable, InjectionToken } from "@angular/core";
import { catchError, Observable, of } from "rxjs";

// base url of the API, provided by the app from its environment file
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

@Injectable({ providedIn: 'root'})
export class ApiRequestService {

  private readonly apiUrl = inject(API_URL);

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
