import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private readonly httpClient: HttpClient) {}

  get(entityName: string) {
    var url = `${environment.apiUrl}/api/${entityName}`;
    return this.httpClient.get<any>(url).pipe(catchError(this.handleError));
  }

  getAll(entityName: string) {
    var url = `${environment.apiUrl}/api/${entityName}`;
    return this.httpClient.get<any[]>(url).pipe(catchError(this.handleError));
  }

  put(
    entityName: string,
    object: any,
    id: string,
    options: any = {}
  ): Observable<any> {
    const url = `${environment.apiUrl}/api/${entityName}/${id}`;
    return this.httpClient
      .put<any>(url, object, options)
      .pipe(catchError(this.handleError));
  }

  post(entityName: string, object: any, options: any = {}): Observable<any> {
    const url = `${environment.apiUrl}/api/${entityName}`;
    return this.httpClient
      .post<any>(url, object, options)
      .pipe(catchError(this.handleError));
  }

  delete(entityName: string, id: any, options: any = {}): Observable<any> {
    const url = `${environment.apiUrl}/api/${entityName}/${id}`;
    return this.httpClient
      .delete<any>(url, options)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    console.log(error);
    return throwError(error);
  }
}
