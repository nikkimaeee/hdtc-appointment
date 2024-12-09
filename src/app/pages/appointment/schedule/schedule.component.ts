import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IAppointmentTime, ISchedule } from '@app/shared/interface';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from 'src/services/http.service';
import { selectRecord, UpdateSchedule, UpdateTimeSlots } from '../store';
import { IProduct } from '@app/shared/interface/product.interface';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit, OnDestroy {
  selectedTime!: number;
  scheduleForm: FormGroup;
  appointmentDate!: string;
  appointmentTime!: IAppointmentTime[];
  today!: Date;
  product!: IProduct[];
  private ngUnsubscribe = new Subject<void>();
  selectedProduct!: number;
  invalidDates: Array<Date> = [];
  showCalendar = false;
  selectedDuration!: number;
  sortOptions!: SelectItem[];
  sortOrder!: number;
  sortField!: string;
  sortKey: any;
  productDetails: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private store: Store,
    private httpSvc: HttpService
  ) {
    this.scheduleForm = this.fb.group({
      product: [0, Validators.min(1)],
      appointmentDate: ['', Validators.required],
      appointmentTime: [0, Validators.min(1)],
      price: [0, Validators.min(1)],
    });

    this.today = new Date();
    this.today.setDate(this.today.getDate() + 1);
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

  ngOnInit(): void {
    this.store
      .select(selectRecord)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(s => {
        this.scheduleForm.patchValue({
          product: s.schedule.product,
          appointmentDate: s.schedule.appointmentDate,
          appointmentTime: s.schedule.appointmentTime,
        });

        this.appointmentDate = s.schedule.appointmentDate
          ? formatDate(s.schedule.appointmentDate, 'MM/dd/yyyy', 'en-US')
          : '';
        this.selectedTime = s.schedule.appointmentTime;
        this.selectedProduct = s.schedule.product;

        let payload = {
          appointmentDate: s.schedule.appointmentDate,
          serviceId: this.selectedProduct,
        };

        if (this.appointmentDate) {
          this.httpSvc
            .post('Appointment/GetAppointmentTime', payload)
            .subscribe(response => {
              this.appointmentTime = response;
              this.showCalendar = true;
            });
        }
      });

    this.httpSvc.get('Admin/GetServices').subscribe(response => {
      this.product = response;
    });

    this.sortOptions = [
      { label: 'Price High to Low', value: '!price' },
      { label: 'Price Low to High', value: 'price' },
    ];
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSortChange(event: any) {
    let value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  getDisabledDays() {
    this.showCalendar = false;
    this.selectedTime = 0;
    this.appointmentDate = '';
    this.scheduleForm.patchValue({
      appointmentDate: '',
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

  resetSelectedTime() {
    this.appointmentTime = [];
    this.scheduleForm.patchValue({
      appointmentTime: 0,
      price: this.productDetails.price,
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

  nextPage() {
    this.store.dispatch(
      UpdateSchedule({ payload: <ISchedule>this.scheduleForm.getRawValue() })
    );

    this.store.dispatch(UpdateTimeSlots({ payload: this.appointmentTime }));
    this.router.navigate(['appointment/review']);
    return;
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

  selecitem(product: any) {
    this.selectedProduct = 0;
    this.productDetails = null;
    this.httpSvc.get(`Admin/GetServicesById/${product.id}`).subscribe(response => {
      this.selectedProduct = product.id;
      this.productDetails = response;
      this.getDisabledDays();
      this.scheduleForm.patchValue({
        product: product.id,
    });
    });
  }

  getgetSelected(product: any) {
    this.selectedProduct == product.id ? 'none' : 'solid';
  }
}
