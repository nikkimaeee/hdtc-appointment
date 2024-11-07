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
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
})
export class AppointmentListComponent implements OnInit {
  pageTitle: string | undefined;
  appointmentList: IAppointmentTable[];
  isLoading: boolean = true;
  display: boolean = false;
  selectedAppointment: any = {};
  totalRecords!: number;
  filter!: string;
  showCalendar = false;
  today!: Date;
  invalidDates: Array<Date> = [];
  appointmentDate!: string;
  appointmentTime!: IAppointmentTime[];
  selectedTime!: number | null;
  selectedDuration!: number;
  displayConfirmDone: boolean = false;
  attachments: any[] = [];
  prescription: string = '';
  rangeDates: Date[] = [];
  status = ['All', 'Approved', 'Pending', 'Cancelled', 'Done'];
  selectedStatus = 'Pending';
  dateFrom: any;
  dateTo: any;

  constructor(
    private httpSvc: HttpService,
    private messageService: MessageService,
    private authSvc: AuthenticationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private _http: HttpClient
  ) {
    this.appointmentList = [];
    this.filter = '';
    this.today = new Date();
    let date = new Date();
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.rangeDates = [firstDay, lastDay];
    this.today.setDate(this.today.getDate() + 1);
  }

  get isAdmin(): boolean {
    return this.authSvc.currentUserValue.role.includes('Admin');
  }

  ngOnInit() {
    this.pageTitle = 'Appointment List';
  }

  addNew() {
    this.router.navigate(['admin/appointment-list/new']);
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
        `Appointment/GetPagedAppointments?page=${currentPage}&rows=${rows}&status=${this.selectedStatus}&dateFrom=${this.dateFrom}&dateTo=${this.dateTo}&filter=${this.filter}`
      )
      .subscribe(response => {
        this.appointmentList = response.data;
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      });
  }

  showDetails(item: IAppointmentTable) {
    this.display = true;
    this.selectedAppointment = item;
  }

  issueRefund(item: IAppointmentTable, action: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to ' + action + ' selected appointment?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // call paypal
        if (!item.isWalkIn) {
          const headers = new HttpHeaders()
            .set('Content-Type', 'application/json; charset=utf-8')
            .set(
              'Authorization',
              `Basic ${Buffer.from(
                `${environment.paypalClientId}:${environment.paypalSecret}`
              ).toString('base64')}`
            );
          this._http
            .post<any[]>(
              `${environment.paypalApi}v2/payments/captures/${item.transactionId}/refund`,
              null,
              { headers: headers }
            )
            .subscribe(
              (response: any) => {
                if (response.status === 'COMPLETED') {
                  this.deleteAppointment(item.id ?? 0);
                } else {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Refund Appointment',
                    detail:
                      'An error encountered when trying to refund transaction',
                  });
                }
              },
              error => {
                console.log(error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Refund Appointment',
                  detail: error.error.details[0].description,
                });
              }
            );
        } else {
          this.deleteAppointment(item.id ?? 0);
        }
      },
    });
  }

  deleteAppointment(id: number) {
    this.httpSvc.delete(`Admin/DeleteAppointment`, id).subscribe(
      response => {
        this.messageService.add({
          severity: response.status.toLowerCase(),
          summary: 'Cancel Appointment',
          detail: response.message,
        });
        let event: LazyLoadEvent = {
          first: 0,
          rows: 10,
        };
        this.filter = '';
        this.loadData(event);
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Cancel Appointment',
          detail: error.message,
        });
      }
    );
  }

  reschedule(item: IAppointmentTable) {
    this.selectedAppointment = item;
    this.selectedTime = null;
    this.appointmentDate = '';
    this.httpSvc.get(`Appointment/GetDisabledDays`).subscribe(response => {
      this.invalidDates = [];
      response.forEach((element: string) => {
        this.invalidDates.push(new Date(element));
      });
      this.showCalendar = true;
    });
  }

  resetSelectedTime() {
    this.appointmentTime = [];
    this.selectedTime = null;
    this.selectedDuration = this.selectedAppointment.product.duration;
    let payload = {
      appointmentDate: formatDate(
        this.appointmentDate,
        'yyyy-MM-ddT00:00:00.000',
        'en-US'
      ),
      serviceId: this.selectedAppointment.product.id,
    };

    this.httpSvc
      .post('Appointment/GetAppointmentTime', payload)
      .subscribe(response => {
        this.appointmentTime = response;
      });
  }

  isFullyBook(day: number, month: number, year: number): boolean {
    if (
      this.invalidDates.find(
        x =>
          x.getDate() === day &&
          x.getMonth() === month &&
          x.getFullYear() === year
      )
    ) {
      return true;
    }
    return false;
  }

  isSelected(id: number): boolean {
    if (this.selectedTime) {
      return this.selectedTime == id;
    }
    return false;
  }

  isTimeDisabled(militaryTime: number): boolean {
    if (this.appointmentTime.length > 0) {
      if (militaryTime == 18) {
        // last timeslot record 6pm - 7pm
        return this.selectedDuration > 1; // disable if duration is more than 1 hour
      } else if (militaryTime == 9) {
        let time = this.appointmentTime.filter(
          x =>
            x.militaryTime <
            militaryTime + this.selectedAppointment.product.duration
        );
        return time.some(x => x.availableSlot <= 0);
      } else {
        let time = this.appointmentTime.filter(
          x =>
            x.militaryTime >= militaryTime &&
            x.militaryTime <
              militaryTime + this.selectedAppointment.product.duration
        );
        return time.some(x => x.availableSlot <= 0);
      }
    }
    return false;
  }

  confirmResched() {
    let payload = {
      appointmentDate: formatDate(
        this.appointmentDate,
        'yyyy-MM-ddT00:00:00.000',
        'en-US'
      ),
      appointmentTime: this.selectedTime,
      appointmentId: this.selectedAppointment.id,
      productId: this.selectedAppointment.product.id,
    };

    this.httpSvc.post('Appointment/Reschedule', payload).subscribe(
      response => {
        this.messageService.add({
          severity: response.status.toLowerCase(),
          summary: 'Reschedule Appointment',
          detail: response.message,
        });

        let event: LazyLoadEvent = {
          first: 0,
          rows: 10,
        };
        this.filter = '';
        this.loadData(event);
        this.showCalendar = false;
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Reschedule Appointment',
          detail: error.message,
        });
        this.showCalendar = false;
      }
    );
  }

  done(item: IAppointmentTable) {
    this.selectedAppointment = item;
    this.displayConfirmDone = true;
  }

  confirmDone() {
    const formData = new FormData();
    this.attachments.forEach(file => {
      formData.append('files[]', file);
    });
    formData.append('prescription', this.prescription);
    this.httpSvc
      .post(
        'Admin/MarkAppointmentDone/' + this.selectedAppointment.id,
        formData
      )
      .subscribe(
        response => {
          this.messageService.add({
            severity: response.status.toLowerCase(),
            summary: 'Mark as Done',
            detail: response.message,
          });

          let event: LazyLoadEvent = {
            first: 0,
            rows: 10,
          };
          this.filter = '';
          this.loadData(event);
          this.displayConfirmDone = false;
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Mark as Done',
            detail: error.message,
          });
          this.displayConfirmDone = false;
        }
      );
  }

  canSetDone(date: any) {
    let dtToday = new Date().setHours(0, 0, 0, 0);
    return new Date(date).getTime() <= new Date(dtToday).getTime();
  }

  uploadFile(event: any) {
    this.attachments = [];
    if (event.files && event.files.length > 0) {
      for (let file of event.files) {
        this.attachments.push(file);
      }
    }
  }

  applyFilter() {
    let event: LazyLoadEvent = {
      first: 0,
      rows: 10,
    };
    this.loadData(event);
  }

  approveAppointment(item: IAppointmentTable) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to approve selected appointment?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpSvc
          .post('Admin/ApproveAppointment/' + item.id, null)
          .subscribe(
            response => {
              this.messageService.add({
                severity: response.status.toLowerCase(),
                summary: 'Mark as Approved',
                detail: response.message,
              });

              let event: LazyLoadEvent = {
                first: 0,
                rows: 10,
              };
              this.filter = '';
              this.loadData(event);
              this.displayConfirmDone = false;
            },
            error => {
              this.messageService.add({
                severity: 'error',
                summary: 'Mark as Approved',
                detail: error.message,
              });
              this.displayConfirmDone = false;
            }
          );
      },
    });
  }
}
