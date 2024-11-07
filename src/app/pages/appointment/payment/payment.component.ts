import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { statusMessage } from '@app/shared/constant';
import { IAppointment, ISchedule } from '@app/shared/interface';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { Subject, take, takeUntil } from 'rxjs';
import { HttpService } from 'src/services/http.service';
import { ResetAppointmentForm, selectRecord } from '../store';
import { IProduct } from '@app/shared/interface/product.interface';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-review',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit, OnDestroy {
  appointmentDetails!: IAppointment;
  private ngUnsubscribe = new Subject<void>();
  product: IProduct | undefined;
  public payPalConfig?: IPayPalConfig;
  public isInitialize: boolean = false;
  disableButtons: boolean = false;
  details: any;
  walkinPayment: boolean = false;

  constructor(
    private store: Store,
    private router: Router,
    private httpService: HttpService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.appointmentDetails = {
      schedule: {
        product: 0,
        appointmentDate: '',
        appointmentTime: 0,
        price: 0,
      },
      timeSlots: [],
      personalInformation: {
        id: 0,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        isPwd: false,
        isSenior: false,
        isPregnant: false,
        medCert: '',
      },
    };
  }

  get scheduleInformation(): ISchedule {
    return this.appointmentDetails.schedule;
  }

  ngOnInit(): void {
    this.store
      .select(selectRecord)
      .pipe(take(1))
      .subscribe(s => {
        if (s.schedule.product === 0) {
          this.router.navigate(['appointment/schedule']);
        }

        console.log(s.personalInformation);

        this.appointmentDetails.schedule = s.schedule;
        this.appointmentDetails.personalInformation = s.personalInformation;
        if (s.schedule.product !== 0) {
          this.httpService
            .get(`Admin/GetServicesById/${s.schedule.product}`)
            .subscribe((response: IProduct) => {
              this.product = response;
              this.details = [
                {
                  name: this.product?.name,
                  price: this.product.price,
                },
              ];
            });
        }

        this.appointmentDetails.timeSlots = s.timeSlots;

        if (!this.isInitialize) {
          this.isInitialize = true;
          this.initConfig();
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  back() {
    this.router.navigate(['appointment/schedule']);
  }

  saveRecord(data: any) {
    let payload = {
      transactionId: data.purchase_units[0].payments.captures[0].id,
      email: data.payer.email_address,
      appointmentDetails: this.appointmentDetails,
      paymentType: 1, //1 for paypal, 0 for cash
    };

    var formData = new FormData();
    formData.append(
      'transactionId',
      data.purchase_units[0].payments.captures[0].id
    );
    formData.append('email', data.payer.email_address);
    formData.append('paymentType', '1');
    formData.append(
      'appointmentDetails.personalInformation.id',
      payload.appointmentDetails.personalInformation.id?.toString() ?? '0'
    );
    formData.append(
      'appointmentDetails.personalInformation.firstName',
      payload.appointmentDetails.personalInformation?.firstName
    );
    formData.append(
      'appointmentDetails.personalInformation.lastName',
      payload.appointmentDetails.personalInformation?.lastName
    );
    formData.append(
      'appointmentDetails.personalInformation.email',
      payload.appointmentDetails.personalInformation.email ?? ''
    );
    formData.append(
      'appointmentDetails.personalInformation.phone',
      payload.appointmentDetails.personalInformation.phone ?? ''
    );
    formData.append(
      'appointmentDetails.personalInformation.address',
      payload.appointmentDetails.personalInformation.address ?? ''
    );
    formData.append(
      'appointmentDetails.personalInformation.isPwd',
      payload.appointmentDetails.personalInformation.isPwd?.toString() ??
        'false'
    );
    formData.append(
      'appointmentDetails.personalInformation.isSenior',
      payload.appointmentDetails.personalInformation.isSenior?.toString() ??
        'false'
    );
    formData.append(
      'appointmentDetails.personalInformation.isPregnant',
      payload.appointmentDetails.personalInformation.isPregnant?.toString() ??
        'false'
    );
    formData.append(
      'appointmentDetails.personalInformation.medCert',
      payload.appointmentDetails.personalInformation.medCert ?? ''
    );

    formData.append(
      'appointmentDetails.schedule.appointmentDate',
      payload.appointmentDetails.schedule.appointmentDate
    );
    formData.append(
      'appointmentDetails.schedule.appointmentTime',
      payload.appointmentDetails.schedule.appointmentTime.toString()
    );
    formData.append(
      'appointmentDetails.schedule.product',
      payload.appointmentDetails.schedule.product.toString()
    );
    formData.append(
      'appointmentDetails.schedule.price',
      payload.appointmentDetails.schedule.price.toString()
    );

    this.httpService
      .post('Appointment/AddAppointment', formData)
      .pipe()
      .subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Appointment Saved',
            detail: `Appointment Details Successfully Saved`,
          });

          if (response.status === 'Success') {
            this.store.dispatch(ResetAppointmentForm());
            this.router.navigate(['admin/appointment-list']);
          }
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Save Record',
            detail: error.message,
          });
        }
      );
  }

  submitAppointment() {
    let payload = {
      appointmentDetails: this.appointmentDetails,
      paymentType: 0, //1 for paypal, 0 for cash
    };

    var formData = new FormData();
    formData.append('transactionId', '');
    formData.append(
      'email',
      payload.appointmentDetails.personalInformation.email ?? ''
    );
    formData.append('paymentType', payload.paymentType.toString());
    formData.append(
      'appointmentDetails.personalInformation.id',
      payload.appointmentDetails.personalInformation.id?.toString() ?? '0'
    );
    formData.append(
      'appointmentDetails.personalInformation.firstName',
      payload.appointmentDetails.personalInformation?.firstName
    );
    formData.append(
      'appointmentDetails.personalInformation.lastName',
      payload.appointmentDetails.personalInformation?.lastName
    );
    formData.append(
      'appointmentDetails.personalInformation.email',
      payload.appointmentDetails.personalInformation.email ?? ''
    );
    formData.append(
      'appointmentDetails.personalInformation.phone',
      payload.appointmentDetails.personalInformation.phone ?? ''
    );
    formData.append(
      'appointmentDetails.personalInformation.address',
      payload.appointmentDetails.personalInformation.address ?? ''
    );
    formData.append(
      'appointmentDetails.personalInformation.isPwd',
      payload.appointmentDetails.personalInformation.isPwd?.toString() ??
        'false'
    );
    formData.append(
      'appointmentDetails.personalInformation.isSenior',
      payload.appointmentDetails.personalInformation.isSenior?.toString() ??
        'false'
    );
    formData.append(
      'appointmentDetails.personalInformation.isPregnant',
      payload.appointmentDetails.personalInformation.isPregnant?.toString() ??
        'false'
    );
    formData.append(
      'appointmentDetails.personalInformation.medCert',
      payload.appointmentDetails.personalInformation.medCert ?? ''
    );

    formData.append(
      'appointmentDetails.schedule.appointmentDate',
      payload.appointmentDetails.schedule.appointmentDate
    );
    formData.append(
      'appointmentDetails.schedule.appointmentTime',
      payload.appointmentDetails.schedule.appointmentTime.toString()
    );
    formData.append(
      'appointmentDetails.schedule.product',
      payload.appointmentDetails.schedule.product.toString()
    );
    formData.append(
      'appointmentDetails.schedule.price',
      payload.appointmentDetails.schedule.price.toString()
    );

    this.httpService
      .post('Appointment/AddAppointment', formData)
      .pipe()
      .subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Appointment Saved',
            detail: `Appointment Details Successfully Saved`,
          });

          if (response.status === 'Success') {
            this.store.dispatch(ResetAppointmentForm());
            this.router.navigate(['admin/appointment-list']);
          }
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Save Record',
            detail: error.message,
          });
        }
      );
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'PHP',
      clientId: environment.paypalClientId,
      createOrderOnClient: data =>
        <ICreateOrderRequest>{
          intent: 'CAPTURE',
          application_context: {
            shipping_preference: 'NO_SHIPPING',
          },
          purchase_units: [
            {
              amount: {
                currency_code: 'PHP',
                value: this.product?.price?.toString(),
                breakdown: {
                  item_total: {
                    currency_code: 'PHP',
                    value: this.product?.price?.toString(),
                  },
                },
              },
              items: [
                {
                  name: this.product?.name,
                  quantity: '1',
                  category: 'PHYSICAL_GOODS',
                  unit_amount: {
                    currency_code: 'PHP',
                    value: this.product?.price?.toString(),
                  },
                },
              ],
            },
          ],
        },
      advanced: {
        commit: 'true',
        // extraQueryParams: [{ name: 'disable-funding', value: 'credit,card' }],
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
      },
      onClientAuthorization: (data: any) => {
        this.saveRecord(data);
      },
      onError: err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Record',
          detail: err.message,
        });
      },
      onClick: (data, actions) => {
        this.disableButtons = true;
      },
    };
  }
}
