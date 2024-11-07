import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@core/auth';
import { IUser } from '@shared/interface';
import { MegaMenuItem, MenuItem } from 'primeng/api';
import { LayoutService } from '@shared/services/app.layout.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  currentUser: IUser | undefined;
  items!: MegaMenuItem[];
  loading = [false, false, false, false];
  isMenuOpen = false;
  isAppointment = false;
  isAdminPage = false;
  tieredItems: MenuItem[] = [];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    public layoutService: LayoutService
  ) {
    this.authenticationService.currentUser.subscribe(
      x => (this.currentUser = x)
    );

    this.items = [
      {
        label: '',
        icon: 'pi pi-fw pi-cog',
        items: [
          [
            {
              label: `${this.currentUser?.firstName} ${this.currentUser?.lastName}`,
              items: [
                {
                  label: 'Profile',
                  icon: 'pi pi-fw pi-user',
                  routerLink: '/admin/profile',
                },
                {
                  label: 'Logout',
                  icon: 'pi pi-fw pi-power-off',
                  command: () => this.logout(),
                },
              ],
            },
          ],
        ],
      },
    ];
    this.loadMenus();
  }

  loadMenus() {
    this.tieredItems = [
      {
        label: 'Home',
        routerLink: [`/`],
        icon: 'my-margin-left',
      },
      {
        label: 'Services Offered',
        routerLink: ['/service-catalog'],
      },
      {
        label: 'Dashboard',
        routerLink: ['/admin'],
        visible: this.isAuthenticated,
      },
      {
        label: 'Contact Us',
        routerLink: ['/contact_us'],
      },
      {
        label: 'Make An Appoinment',
        routerLink: ['/appointment'],
        visible: !this.isAdmin,
      },
      {
        label: 'Login',
        routerLink: ['/login'],
        visible: !this.isAuthenticated,
      },
      {
        label: 'Sign Up',
        routerLink: ['/register'],
        visible: !this.isAuthenticated,
      },
      {
        label: `${this.currentUser?.firstName} ${this.currentUser?.lastName}`,
        items: [
          {
            label: 'Profile',
            icon: 'pi pi-fw pi-user',
            routerLink: '/admin/profile',
          },
          {
            label: 'Logout',
            icon: 'pi pi-fw pi-power-off',
            command: () => this.logout(),
          },
        ],
        visible: this.isAuthenticated,
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
    // this.loadMenus();
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
