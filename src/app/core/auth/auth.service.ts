import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { IUser } from '@shared/interface';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<IUser>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  get currentUserValue(): IUser {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/api/Authenticate/login`, {
        username,
        password,
      })
      .pipe(
        map(response => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(response));
          const token = response.token;
          localStorage.setItem('jwt', token);
          this.currentUserSubject.next(response);
          return response;
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwt');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    if (user && Object.keys(user).length > 0) {
      return true;
    }
    return false;
  }
}
