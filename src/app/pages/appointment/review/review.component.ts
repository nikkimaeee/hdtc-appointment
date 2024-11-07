import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { statusMessage } from '@app/shared/constant';
import {
  IAppointment,
  IPatientInformation,
  ISchedule,
} from '@app/shared/interface';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { Subject, take, takeUntil } from 'rxjs';
import { HttpService } from 'src/services/http.service';
import {
  ResetAppointmentForm,
  selectRecord,
  UpdatePatientInformation,
} from '../store';
import { IProduct } from '@app/shared/interface/product.interface';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent implements OnInit, OnDestroy {
  reviewForm!: IAppointment;
  private ngUnsubscribe = new Subject<void>();
  product: IProduct | undefined;
  timeSchedule: string | undefined;
  isPwd: boolean = false;
  isSenior: boolean = false;
  isPregnant: boolean = false;

  id: any;

  constructor(
    private store: Store,
    private router: Router,
    private httpService: HttpService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.reviewForm = {
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
        medCert: null,
      },
    };
  }

  get scheduleInformation(): ISchedule {
    return this.reviewForm.schedule;
  }

  get personalInformation(): IPatientInformation {
    return this.reviewForm.personalInformation;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.store
      .select(selectRecord)
      .pipe(take(1))
      .subscribe(s => {
        if (s.schedule.product === 0) {
          this.router.navigate(['appointment/schedule']);
        }

        this.reviewForm.schedule = s.schedule;
        if (s.schedule.product !== 0) {
          this.httpService
            .get(`Admin/GetServicesById/${s.schedule.product}`)
            .subscribe((response: IProduct) => {
              this.product = response;
            });
        }

        this.reviewForm.timeSlots = s.timeSlots;
      });

    this.httpService
      .get('Appointment/GetPatientInformation')
      .subscribe(response => {
        this.reviewForm.personalInformation = response[0];
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  back() {
    this.router.navigate(['appointment/schedule']);
  }

  saveRecord() {
    this.httpService
      .post('Appointment/SaveAppointment', this.reviewForm)
      .pipe()
      .subscribe(
        response => {
          this.messageService.add({
            severity: response.status.toLowerCase(),
            summary: 'Save Record',
            detail: response.message,
          });

          if (response.status === 'Success') {
            this.store.dispatch(ResetAppointmentForm());
            this.router.navigate(['appointment/notice']);
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

  get getTimeSlot(): string {
    if (this.reviewForm.timeSlots.length > 0 && this.product) {
      let timeSlots = this.reviewForm.timeSlots;
      let duration = this.product.duration ?? 0;
      let selectedTime = this.scheduleInformation.appointmentTime;
      let selectedSlotDetails = timeSlots.find(x => x.id === selectedTime);
      let selectedMilitaryTime = selectedSlotDetails?.militaryTime ?? 0;
      if (selectedMilitaryTime === 18) {
        return selectedSlotDetails?.name ?? '';
      } else {
        let lastSelectedSlot = timeSlots.find(
          x => x.militaryTime === selectedMilitaryTime + (duration - 1)
        );
        let lastSelectedSlotName = lastSelectedSlot?.name.split('-')[1];
        return `${selectedSlotDetails?.name
          .split('-')[0]
          .trim()} - ${lastSelectedSlotName?.trim()}`;
      }
    }

    return '';
  }

  nextPage() {
    this.store.dispatch(
      UpdatePatientInformation({ payload: this.reviewForm.personalInformation })
    );

    this.router.navigate(['appointment/payment']);
    return;
  }

  OnCheckBoxCheck(event: any, controlName: string) {
    if (controlName == 'isPwd' && event.checked) {
      this.reviewForm.personalInformation.isPwd = true;
      this.reviewForm.personalInformation.isPregnant = false;
      this.reviewForm.personalInformation.isSenior = false;
    } else if (controlName == 'isPregnant' && event.checked) {
      this.reviewForm.personalInformation.isPwd = false;
      this.reviewForm.personalInformation.isPregnant = true;
      this.reviewForm.personalInformation.isSenior = false;
    } else if (controlName == 'isSenior' && event.checked) {
      this.reviewForm.personalInformation.isPwd = false;
      this.reviewForm.personalInformation.isPregnant = false;
      this.reviewForm.personalInformation.isSenior = true;
    }

    if (!event.checked) {
      this.reviewForm.personalInformation.medCert = null;
    }
  }

  uploadFile(event: any) {
    for (let file of event.files) {
      this.reviewForm.personalInformation.medCert = file;
    }
  }

  onRemove() {
    this.reviewForm.personalInformation.medCert = null;
  }
}
