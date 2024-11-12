import {
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
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
export class TopbarComponent implements OnInit, OnChanges {
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
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;

      this.items = [
        {
          label: '',
          icon: 'pi pi-fw pi-cog',
          items: [
            [
              {
                label: this.getUserDetails,
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
    });
  }

  get getUserDetails() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser != '{}') {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }

    return '';
  }

  ngOnInit(): void {
    if (this.router.url.split('/')[1] === 'appointment') {
      this.isAppointment = true;
    }
    if (this.router.url.split('/')[1] === 'admin') {
      this.isAdminPage = true;
    }
  }

  ngOnChanges(): void {
    console.log('change');
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
