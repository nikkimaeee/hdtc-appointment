import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from '@app/shared/services/app.layout.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit {
  model: any[] = [];

  constructor(public layoutService: LayoutService) {}

  get isAdmin(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role.some((x: any) => x === 'Admin')) {
      return true;
    }
    return false;
  }
  ngOnInit() {
    this.model = [
      {
        label: 'Menu',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            routerLink: ['/admin'],
          },
          {
            label: 'Appointments',
            icon: 'pi pi-calendar',
            routerLink: ['appointment-list'],
          },
          {
            label: 'Patient Records',
            icon: 'pi pi-list',
            routerLink: ['patient-records'],
            visible: this.isAdmin,
          },
          {
            label: 'Inquiries',
            icon: 'pi pi-comments',
            routerLink: ['inquiries'],
            visible: this.isAdmin,
          },
          {
            label: 'Admin',
            icon: 'pi pi-fw pi-cog',
            visible: this.isAdmin,
            items: [
              {
                label: 'Users',
                icon: 'pi pi-fw pi-user',
                routerLink: ['users'],
                visible: this.isAdmin,
              },
              {
                label: 'Services Offered',
                icon: 'pi pi-fw pi-sitemap',
                routerLink: ['services'],
                visible: this.isAdmin,
              },
            ],
          },
        ],
      },
    ];
  }
}
