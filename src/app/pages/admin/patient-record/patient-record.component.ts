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
  selector: 'app-patient-record',
  templateUrl: './patient-record.component.html',
  styleUrls: ['./patient-record.component.scss'],
})
export class PatientRecordComponent implements OnInit {
  pageTitle: string | undefined;
  records: any[];
  isLoading: boolean = true;
  selectedRecord: any = {};
  totalRecords!: number;
  filter!: string;
  display: boolean = false;

  constructor(
    private httpSvc: HttpService,
    private messageService: MessageService,
    private authSvc: AuthenticationService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.records = [];
    this.filter = '';
  }

  get isAdmin(): boolean {
    return this.authSvc.currentUserValue.role.includes('Admin');
  }

  ngOnInit() {
    this.pageTitle = 'Patient Records';
  }

  loadData(event: LazyLoadEvent) {
    let first = event.first ?? 0;
    let rows = event.rows ?? 10;
    let currentPage = event.first == 0 ? 1 : first / rows + 1;
    this.httpSvc
      .get(
        `Admin/GetPatientRecords?page=${currentPage}&rows=${rows}&filter=${this.filter}`
      )
      .subscribe(response => {
        this.records = response.data;
        this.totalRecords = response.totalRows;
        this.isLoading = false;
      });
  }

  showDetails(item: any) {
    this.router.navigate([`admin/patient-records/details/${item.id}`]);
  }
}
