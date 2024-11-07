import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  MinLengthValidator,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import {
  IAppointmentTable,
  IAppointmentTime,
  IPatientInformation,
} from '@app/shared/interface';
import { IProduct } from '@app/shared/interface/product.interface';
import { HttpService } from '@app/shared/services';
import { environment } from '@environments/environment';
import {
  faBars,
  faBell,
  faChartLine,
  faL,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
})
export class AppointmentFormComponent implements OnInit {
  pageTitle: string | undefined;
  appointmentForm: FormGroup;
  appointmentDate!: string;
  today!: Date;
  invalidDates: Array<Date> = [];
  appointmentTime!: IAppointmentTime[];
  selectedTime!: number;
  product!: IProduct[];
  selectedDuration!: number;
  selectedProduct!: number;
  showCalendar = false;
  newPatient: boolean = true;
  patientList: IPatientInformation[];
  selectedPatient: number | null | undefined;

  constructor(
    private httpSvc: HttpService,
    private messageService: MessageService,
    private authSvc: AuthenticationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.patientList = [];
    this.today = new Date();
    this.today.setDate(this.today.getDate());

    this.appointmentForm = this.fb.group({
      patientInformation: this.fb.group({
        id: 0,
        firstName: ['', [Validators.required, Validators.pattern(/[\S]/)]],
        lastName: ['', [Validators.required, Validators.pattern(/[\S]/)]],
        email: ['', Validators.email],
        phone: ['', Validators.required],
        address: '',
        isPwd: false,
        isSenior: false,
        isPregnant: false,
        medCert: '',
      }),
      schedule: this.fb.group({
        paymentType: 0,
        isWalkIn: true,
        product: [0, Validators.min(1)],
        appointmentDate: ['', Validators.required],
        appointmentTime: [0, Validators.min(1)],
        price: [0, Validators.min(1)],
      }),
    });
  }

  get isAdmin(): boolean {
    return this.authSvc.currentUserValue.role.includes('Admin');
  }

  get productDetails(): any {
    if (this.product && this.product !== undefined) {
      return this.product.find(x => x.id === this.selectedProduct);
    }
    return null;
  }

  get patientDetails(): any {
    if (this.patientList && this.patientList !== undefined) {
      return this.patientList.find(x => x.id === this.selectedPatient);
    }
    return null;
  }

  get enableUpload() {
    if (
      this.appointmentForm.get('patientInformation.isPwd')?.value ||
      this.appointmentForm.get('patientInformation.isPregnant')?.value ||
      this.appointmentForm.get('patientInformation.isSenior')?.value
    ) {
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.pageTitle = 'Services Offered';
    this.httpSvc.get('Admin/GetServices').subscribe(response => {
      this.product = response;
    });

    this.httpSvc.get('Admin/GetPatients').subscribe(response => {
      this.patientList = response;
    });
  }

  save() {
    let payload = this.appointmentForm.getRawValue();
    payload.schedule.appointmentDate = formatDate(
      payload.schedule.appointmentDate,
      'yyyy-MM-ddT00:00:00.000',
      'en-US'
    );
    payload.schedule.isWalkIn = true;

    var formData = new FormData();
    formData.append('patientInformation.id', payload.patientInformation.id);
    formData.append(
      'patientInformation.firstName',
      payload.patientInformation.firstName
    );
    formData.append(
      'patientInformation.lastName',
      payload.patientInformation.lastName
    );
    formData.append(
      'patientInformation.email',
      payload.patientInformation.email
    );
    formData.append(
      'patientInformation.phone',
      payload.patientInformation.phone
    );
    formData.append(
      'patientInformation.address',
      payload.patientInformation.address
    );
    formData.append(
      'patientInformation.isPwd',
      payload.patientInformation.isPwd
    );
    formData.append(
      'patientInformation.isSenior',
      payload.patientInformation.isSenior
    );
    formData.append(
      'patientInformation.isPregnant',
      payload.patientInformation.isPregnant
    );
    formData.append(
      'patientInformation.medCert',
      payload.patientInformation.medCert
    );

    formData.append('schedule.paymentType', payload.schedule.paymentType);
    formData.append('schedule.isWalkIn', payload.schedule.isWalkIn);
    formData.append('schedule.product', payload.schedule.product);
    formData.append(
      'schedule.appointmentDate',
      payload.schedule.appointmentDate
    );
    formData.append(
      'schedule.appointmentTime',
      payload.schedule.appointmentTime
    );
    formData.append('schedule.price', payload.schedule.price);

    this.httpSvc
      .post('Admin/CreateAppointment', formData)
      .pipe()
      .subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Appointment Saved',
            detail: `Appointment Details Successfully Saved`,
          });

          if (response.status === 'Success') {
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

  validateControl(parent: string, controlName: string): boolean {
    if (
      (this.appointmentForm.get(`${parent}.${controlName}`)?.dirty ||
        this.appointmentForm.get(`${parent}.${controlName}`)?.touched) &&
      this.appointmentForm.get(`${parent}.${controlName}`)?.invalid
    ) {
      return true;
    }
    return false;
  }

  resetSelectedTime() {
    this.appointmentTime = [];
    this.appointmentForm.patchValue({
      schedule: {
        appointmentTime: [],
        price: this.productDetails.price,
      },
    });

    this.selectedTime = 0;
    this.selectedDuration =
      this.product.find(x => x.id === this.selectedProduct)?.duration ?? 0;
    let payload = {
      appointmentDate: formatDate(
        this.appointmentDate,
        'yyyy-MM-ddT00:00:00.000',
        'en-US'
      ),
      serviceId: this.selectedProduct,
    };

    let currentProduct = this.product.find(x => x.id === this.selectedProduct);
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
          x => x.militaryTime < militaryTime + this.productDetails.duration
        );
        return time.some(x => x.availableSlot <= 0);
      } else {
        let time = this.appointmentTime.filter(
          x =>
            x.militaryTime >= militaryTime &&
            x.militaryTime < militaryTime + this.productDetails.duration
        );
        return time.some(x => x.availableSlot <= 0);
      }
    }
    return false;
  }

  getDisabledDays(event: any) {
    this.showCalendar = false;
    this.selectedTime = 0;
    this.appointmentDate = '';
    this.appointmentForm.patchValue({
      schedule: {
        appointmentDate: '',
      },
    });

    if (this.selectedProduct) {
      this.httpSvc.get(`Appointment/GetDisabledDays`).subscribe(response => {
        this.invalidDates = [];
        response.forEach((element: string) => {
          this.invalidDates.push(new Date(element));
        });
        this.showCalendar = true;
      });
    }
  }

  onNewPatientChange() {
    this.selectedPatient = null;
    if (!this.newPatient) {
      this.resetPatientInformation();
    }
  }

  updatePatientInformation($event: any) {
    this.resetPatientInformation();
    if (this.selectedPatient) {
      let patient = this.patientList.find(x => x.id === this.selectedPatient);
      this.appointmentForm.patchValue({
        patientInformation: {
          id: patient?.id,
          firstName: patient?.firstName,
          lastName: patient?.lastName,
          email: patient?.email,
          phone: patient?.phone,
          address: patient?.address,
          isPwd: patient?.isPwd,
          isSenior: patient?.isSenior,
          isPregnant: patient?.isPregnant,
          medCert: '',
        },
      });
    }
    this.appointmentForm.updateValueAndValidity();
  }

  resetPatientInformation() {
    this.appointmentForm.patchValue({
      patientInformation: {
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
    });

    this.appointmentForm.get('patientInformation')?.reset();
    this.appointmentForm.updateValueAndValidity();
  }

  OnCheckBoxCheck(event: any, controlName: string) {
    if (controlName == 'isPwd' && event.checked) {
      this.appointmentForm.patchValue({
        patientInformation: {
          isPwd: true,
          isPregnant: false,
          isSenior: false,
        },
      });
    } else if (controlName == 'isPregnant' && event.checked) {
      this.appointmentForm.patchValue({
        patientInformation: {
          isPwd: false,
          isPregnant: true,
          isSenior: false,
        },
      });
    } else if (controlName == 'isSenior' && event.checked) {
      this.appointmentForm.patchValue({
        patientInformation: {
          isPwd: false,
          isPregnant: false,
          isSenior: true,
        },
      });
    }

    if (event.checked) {
      this.appointmentForm.get('patientInformation.medCert')?.markAsDirty();
      this.appointmentForm.get('patientInformation.medCert')?.markAsTouched();
      this.appointmentForm
        .get('patientInformation.medCert')
        ?.setValidators(Validators.required);
      this.appointmentForm
        .get('patientInformation.medCert')
        ?.setErrors({ required: true });
    } else {
      this.appointmentForm
        .get('patientInformation.medCert')
        ?.setValidators(null);
      this.appointmentForm.get('patientInformation.medCert')?.setErrors(null);
      this.appointmentForm.patchValue({
        patientInformation: { medCert: '' },
      });
    }
    this.appointmentForm.updateValueAndValidity();
  }

  uploadFile(event: any) {
    for (let file of event.files) {
      this.appointmentForm.patchValue({
        patientInformation: { medCert: file },
      });
      this.appointmentForm
        .get('patientInformation.medCert')
        ?.updateValueAndValidity();
    }
  }

  onRemove() {
    this.appointmentForm.patchValue({
      patientInformation: { medCert: '' },
    });

    this.appointmentForm.updateValueAndValidity();
  }
}
