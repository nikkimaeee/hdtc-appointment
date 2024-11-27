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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { style } from '@angular/animations';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

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
  patientChartDate: Date[] = [];
  salesBreakdownData: any;
  chartOption: any;
  plugin = ChartDataLabels;
  patientData: any;
  newPatientCount: number = 0;
  oldPatientCount: number = 0;
  isPatientChartAnnual: boolean = false;
  patientChartYear: Date = new Date();

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
    this.patientChartDate = [firstDay, lastDay];
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

    this.chartOption = {
      plugins: {
        legend: {
          labels: {
            color: '#495057',
          },
          position: 'bottom',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (tooltipItem: any, data: any) => {
              return `${tooltipItem.label} : ${tooltipItem.raw}%`;
            },
          },
        },
      },
    };

    if (this.isAdmin) {
      this.loadUsers();
      this.loadRegistration();
      this.loadSalesBreakdown();

      let payload = {
        dateFrom: formatDate(
          this.patientChartDate[0],
          'yyyy-MM-ddT00:00:00.000',
          'en-US'
        ),
        dateTo: formatDate(
          this.patientChartDate[1],
          'yyyy-MM-ddT00:00:00.000',
          'en-US'
        ),
      };

      this.loadPatientChart(payload);
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

  loadSalesBreakdown() {
    this.httpSvc.get('Admin/GetServiceBreakdownChart').subscribe(response => {
      let labels: any = [];
      let percentage: any = [];
      let bgcolor: any = [];
      response.forEach((element: any) => {
        labels.push(element.productName);
        percentage.push(element.percentage);
        bgcolor.push(
          `rgb(${this.randomNum()}, ${this.randomNum()}, ${this.randomNum()}`
        );
      });

      if (response) {
        this.salesBreakdownData = {
          labels: labels,
          datasets: [
            {
              data: percentage,
              backgroundColor: bgcolor,
            },
          ],
        };
      }
    });
  }

  loadPatientChart(payload: any) {
    this.httpSvc.post('Admin/GetPatientChart', payload).subscribe(response => {
      let labels: any = [];
      let percentage: any = [];
      let bgcolor: any = [];
      response.forEach((element: any) => {
        labels.push(element.patientType);
        percentage.push(element.percentage);
        bgcolor.push(
          `rgb(${this.randomNum()}, ${this.randomNum()}, ${this.randomNum()}`
        );
        if (element.patientType === 'New Patient') {
          this.newPatientCount = element.count;
        } else {
          this.oldPatientCount = element.count;
        }
      });

      if (response) {
        this.patientData = {
          labels: labels,
          datasets: [
            {
              data: percentage,
              backgroundColor: bgcolor,
            },
          ],
        };
      }
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
          ? formatDate(
              new Date(this.year.getFullYear(), 0, 1),
              'yyyy-MM-ddT00:00:00.000',
              'en-US'
            )
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

  applyPatientChartFilter() {
    let payload = {};

    if (this.patientChartDate || this.isPatientChartAnnual) {
      payload = {
        dateFrom: this.isPatientChartAnnual
          ? formatDate(
              new Date(this.patientChartYear.getFullYear(), 0, 1),
              'yyyy-MM-ddT00:00:00.000',
              'en-US'
            )
          : formatDate(
              this.patientChartDate[0],
              'yyyy-MM-ddT00:00:00.000',
              'en-US'
            ),
        dateTo: this.isPatientChartAnnual
          ? formatDate(
              new Date(this.patientChartYear.getFullYear(), 11, 31),
              'yyyy-MM-ddT00:00:00.000',
              'en-US'
            )
          : formatDate(
              this.patientChartDate[1],
              'yyyy-MM-ddT00:00:00.000',
              'en-US'
            ),
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
      };
    }

    this.loadPatientChart(payload);
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

  randomNum() {
    return Math.floor(Math.random() * (235 - 52 + 1) + 52);
  }

  extractSalesReport() {
    console.log(this.sales);
    let columns = [
      {
        text: 'Patient Name',
        style: 'tableHeader',
        alignment: 'center',
      },
      {
        text: 'Appointment',
        style: 'tableHeader',
        alignment: 'center',
      },
      {
        text: 'Services',
        style: 'tableHeader',
        alignment: 'center',
      },
      {
        text: 'Status',
        style: 'tableHeader',
        alignment: 'center',
      },
      {
        text: 'Price',
        style: 'tableHeader',
        alignment: 'center',
      },
    ];
    let dd: TDocumentDefinitions = {
      content: [
        {
          text: 'Sales Report',
          style: 'header',
        },
        {
          text: `Total Sales: ₱${parseFloat(this.totals.toString())
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
          style: 'salesTotal',
        },
        {
          table: {
            heights: [30, 'auto'],
            widths: ['*', '*', '*', 70, 70],
            body: this.buildTableBody(columns),
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return rowIndex % 2 === 0 ? '#CCCCCC' : null;
            },
          },
        },
      ],
      pageSize: 'A4',
      pageOrientation: 'landscape',
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
        salesTotal: {
          fontSize: 15,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: 'right',
        },
      },
    };

    pdfMake.createPdf(dd).print();
  }

  buildTableBody(columns: any) {
    let body: any = [];

    body.push(columns);
    this.sales.forEach(element => {
      let dataRow = [];
      dataRow.push(element.patientName);
      dataRow.push(element.appointment);
      dataRow.push(element.service);
      dataRow.push(element.status);
      dataRow.push(
        `₱${parseFloat(element.price.toString())
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
      );
      body.push(dataRow);
    });
    return body;
  }
}
