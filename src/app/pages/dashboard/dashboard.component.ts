import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import { HttpService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { faBars, faBell, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  isOpen = false;
  faBars = faBars;
  faBell = faBell;
  faChartLine = faChartLine;
  basicData: any;
  basicOptions: any;
  userCount!: number;
  pendingAppointments!: number;
  doneAppointments!: number;
  cancelledAppointments!: number;
  registrationCount!: number;
  isAdmin = false;
  sales: any[] = [];
  totals: number = 0;
  totalRows = 0;
  rangeDates: Date[] = [];
  status = ['All', 'Approved', 'Pending', 'Cancelled', 'Done'];
  selectedStatus = 'All';
  patientTable: any[] = [];
  nextAppointment: any;
  dateToday = new Date().setHours(0, 0, 0, 0);
  display: boolean = false;
  selectedRecord: any;
  isPasswordAccepted: boolean = false;
  showPassword: boolean = false;
  salesReportPassword: string = '';
  isAnnual: boolean = false;
  year: Date = new Date();

  pageTitle: string | undefined;
  constructor(
    private httpSvc: HttpService,
    private messageService: MessageService,
    private authSvc: AuthenticationService,
    private router: Router
  ) {
    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.rangeDates = [firstDay, lastDay];
  }

  ngOnInit() {
    let storedBool = localStorage.getItem('isPasswordAccepted')
      ? JSON.parse(localStorage.getItem('isPasswordAccepted') || '{}')
      : null;
    if (storedBool) {
      this.isPasswordAccepted = storedBool;
    }
    this.pageTitle = 'Home';

    this.isAdmin = this.authSvc.currentUserValue.role.some(
      (x: any) => x === 'Admin'
    );

    if (this.isAdmin) {
      this.loadUsers();
      this.loadRegistration();
    }

    this.loadPendingAppointments();

    if (!this.isAdmin) {
      this.loadPatientHistory();
    }

    if (this.isPasswordAccepted) {
      let payload = {
        dateFrom: formatDate(
          this.rangeDates[0],
          'yyyy-MM-ddT00:00:00.000',
          'en-US'
        ),
        dateTo: formatDate(
          this.rangeDates[1],
          'yyyy-MM-ddT00:00:00.000',
          'en-US'
        ),
        status: this.selectedStatus,
      };

      this.loadSales(payload);
    }
  }

  loadSales(payload: any) {
    this.httpSvc.post('Admin/GetSales', payload).subscribe(response => {
      this.sales = response;
      this.calculateTotalSales();
    });
  }

  calculateTotalSales() {
    this.totals = 0;
    let completedSales = this.sales.filter(x => x.status === 'Done');
    if (completedSales.length > 0) {
      this.totals = completedSales
        .map(x => x.price)
        .reduce((sum, current) => sum + current);
    }
  }

  loadUsers() {
    this.httpSvc.get('Admin/GetAllUsers').subscribe(
      response => {
        this.userCount = response.totalRecords;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Get User Count',
          detail: error.message,
        });
      }
    );
  }

  loadPendingAppointments() {
    this.httpSvc.get('Appointment/GetAppointments').subscribe(
      response => {
        this.pendingAppointments = response.filter(
          (x: any) => x.appointmentInformation.status == 1
        ).length;
        this.doneAppointments = response.filter(
          (x: any) => x.appointmentInformation.status == 0
        ).length;
        this.cancelledAppointments = response.filter(
          (x: any) => x.appointmentInformation.status == 2
        ).length;

        this.nextAppointment = response
          .sort((a: any, b: any) => {
            return (
              <any>new Date(a.appointmentInformation.appointmentDate) -
              <any>new Date(b.appointmentInformation.appointmentDate)
            );
          })
          .filter(
            (x: any) =>
              new Date(x.appointmentInformation.appointmentDate).getTime() >=
                new Date(this.dateToday).getTime() &&
              x.appointmentInformation.status === 1
          )
          .map((x: any) => x.appointmentInformation.appointmentDate);
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Get Appointment Count',
          detail: error.message,
        });
      }
    );
  }

  loadRegistration() {
    this.httpSvc.get('Admin/GetPatients').subscribe(
      response => {
        this.registrationCount = response.length;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Get Registration Count',
          detail: error.message,
        });
      }
    );
  }

  applyFilter() {
    let payload = {};

    if (this.rangeDates || this.isAnnual) {
      payload = {
        dateFrom: this.isAnnual
          ? formatDate(this.year, 'yyyy-MM-ddT00:00:00.000', 'en-US')
          : formatDate(this.rangeDates[0], 'yyyy-MM-ddT00:00:00.000', 'en-US'),
        dateTo: this.isAnnual
          ? formatDate(
              new Date(this.year.getFullYear(), 11, 31),
              'yyyy-MM-ddT00:00:00.000',
              'en-US'
            )
          : formatDate(this.rangeDates[1], 'yyyy-MM-ddT00:00:00.000', 'en-US'),
        status: this.selectedStatus,
      };
    } else {
      payload = {
        dateFrom: formatDate(
          new Date('1/1/0001 12:00:00 AM'),
          'yyyy-MM-ddT00:00:00.000',
          'en-US'
        ),
        dateTo: formatDate(
          new Date('12/31/2050 12:00:00 AM'),
          'yyyy-MM-ddT00:00:00.000',
          'en-US'
        ),
        status: this.selectedStatus,
      };
    }

    this.loadSales(payload);
    this.calculateTotalSales();
  }

  loadPatientHistory() {
    this.httpSvc.get('Admin/GetPatientHistory').subscribe(response => {
      this.patientTable = response.filter(
        (x: any) =>
          new Date(x.information.appointmentDate).getTime() <=
          new Date(this.dateToday).getTime()
      );
    });
  }

  showDetails(item: any) {
    this.display = true;
    this.selectedRecord = item;
  }

  submitPassword() {
    let payload = {
      dateFrom: formatDate(
        this.rangeDates[0],
        'yyyy-MM-ddT00:00:00.000',
        'en-US'
      ),
      dateTo: formatDate(
        this.rangeDates[1],
        'yyyy-MM-ddT00:00:00.000',
        'en-US'
      ),
      status: this.selectedStatus,
    };

    if (this.salesReportPassword === 'password') {
      this.isPasswordAccepted = true;
      this.salesReportPassword = '';
      this.showPassword = false;
      localStorage.setItem(
        'isPasswordAccepted',
        JSON.stringify(this.isPasswordAccepted)
      );
      this.loadSales(payload);
    }
  }

  hideSales() {
    localStorage.removeItem('isPasswordAccepted');
    this.isPasswordAccepted = false;
  }

  exportExcel() {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.sales);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'products');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }
}
