import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '@app/shared/services';
import {
  ConfirmationService,
  LazyLoadEvent,
  MessageService,
} from 'primeng/api';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  items: any;

  isLoading: boolean = true;
  filter!: string;
  totalRecords!: number;

  constructor(
    private httpSvc: HttpService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.filter = '';
  }

  ngOnInit(): void {
    console.log('init');
  }

  addUser() {
    this.router.navigate(['admin/users/new']);
  }

  loadUsers(event: LazyLoadEvent) {
    let first = event.first ?? 0;
    let rows = event.rows ?? 10;
    let currentPage = event.first == 0 ? 1 : first / rows + 1;
    this.httpSvc
      .get(
        `Admin/GetAllUsers?page=${currentPage}&rows=${rows}&filter=${this.filter}`
      )
      .subscribe(response => {
        this.items = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      });
  }

  editUser(item: any) {
    this.router.navigate([`admin/users/edit/${item.userId}`]);
  }

  deleteUser(item: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete selected record?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpSvc.delete(`Admin/DeleteUser`, item.userId).subscribe(
          response => {
            this.messageService.add({
              severity: response.status.toLowerCase(),
              summary: 'Delete Record',
              detail: response.message,
            });

            let event: LazyLoadEvent = {
              first: 0,
              rows: 10,
            };
            this.filter = '';
            this.loadUsers(event);
          },
          error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Record',
              detail: error.message,
            });
          }
        );
      },
    });
  }
}
