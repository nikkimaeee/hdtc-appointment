import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  UrlTree,
} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

import { AuthenticationService } from '@core/auth';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private jwtHelper: JwtHelperService,
    private messageService: MessageService
  ) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    if (this.authenticationService.isAuthenticated()) {
      // logged in so return true
      const token = localStorage.getItem('jwt');
      const currentUser = JSON.parse(
        localStorage.getItem('currentUser') || '{}'
      );
      if (token && !this.jwtHelper.isTokenExpired(token)) {
        const role = childRoute.data['role'];
        if (role) {
          if (!currentUser.role.some((x: any) => x === role)) {
            return false;
          }
        }
        return true;
      }
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Session Expired',
      detail: 'Session has Expired',
    });

    this.authenticationService.logout();
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login']);
    return false;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authenticationService.isAuthenticated()) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login']);
    return false;
  }
}
