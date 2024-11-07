import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import { IAppointmentTable, IAppointmentTime } from '@app/shared/interface';
import { IProduct } from '@app/shared/interface/product.interface';
import { HttpService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { faBars, faBell, faChartLine } from '@fortawesome/free-solid-svg-icons';
import {
  ConfirmationService,
  LazyLoadEvent,
  MessageService,
} from 'primeng/api';
import { Table } from 'primeng/table';
import { Buffer } from 'buffer';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss'],
})
export class InquiryComponent implements OnInit {
  pageTitle: string | undefined;
  inquiryList: any[];
  isLoading: boolean = true;
  totalRecords!: number;
  filter!: string;
  rangeDates: Date[] = [];
  status = ['All', 'Resolved', 'Pending'];
  selectedStatus = 'Pending';
  dateFrom: any;
  dateTo: any;

  constructor(
    private httpSvc: HttpService,
    private messageService: MessageService,
    private authSvc: AuthenticationService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.inquiryList = [];
    this.filter = '';
    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.rangeDates = [firstDay, lastDay];
  }

  get isAdmin(): boolean {
    return this.authSvc.currentUserValue.role.includes('Admin');
  }

  ngOnInit() {
    this.pageTitle = 'Inquiries';
  }

  loadData(event: LazyLoadEvent) {
    this.dateFrom = formatDate(
      this.rangeDates[0],
      'yyyy-MM-ddT00:00:00.000',
      'en-US'
    );
    this.dateTo = formatDate(
      this.rangeDates[1],
      'yyyy-MM-ddT00:00:00.000',
      'en-US'
    );

    let first = event.first ?? 0;
    let rows = event.rows ?? 10;
    let currentPage = event.first == 0 ? 1 : first / rows + 1;
    this.httpSvc
      .get(
        `Inquiries/GetInquiries?page=${currentPage}&rows=${rows}&status=${this.selectedStatus}&dateFrom=${this.dateFrom}&dateTo=${this.dateTo}&filter=${this.filter}`
      )
      .subscribe(response => {
        this.inquiryList = response.data;
        this.totalRecords = response.totalRows;
        this.isLoading = false;
      });
  }

  showDetails(item: any) {
    this.router.navigate([`admin/inquiries/details/${item.id}`]);
  }

  applyFilter() {
    let event: LazyLoadEvent = {
      first: 0,
      rows: 10,
    };
    this.loadData(event);
  }
}
