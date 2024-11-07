import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import { IUser } from '../interface';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isAppointment = false;
  isAdminPage = false;
  currentUser: IUser | undefined;
  items!: MenuItem[];

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe(
      x => (this.currentUser = x)
    );
    this.items = [
      {
        label: `${this.currentUser?.firstName} ${this.currentUser?.lastName}`,
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'Profile',
            icon: 'pi pi-fw pi-user-plus',
            routerLink: [`/admin/profile`],
          },
          {
            label: 'Logout',
            icon: 'pi pi-fw pi-power-off',
            command: () => this.logout(),
          },
        ],
      },
    ];
  }

  ngOnInit(): void {
    if (this.router.url.split('/')[1] === 'appointment') {
      this.isAppointment = true;
    }
    if (this.router.url.split('/')[1] === 'admin') {
      this.isAdminPage = true;
    }
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/']);
  }

  get isAuthenticated(): boolean {
    return this.authenticationService.isAuthenticated();
  }

  get isAdmin(): boolean {
    if (this.isAuthenticated) {
      return this.authenticationService.currentUserValue.role.includes('Admin');
    }
    return false;
  }
}
