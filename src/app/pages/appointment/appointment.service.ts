import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { DatePipe } from '@angular/common';
import { HttpService } from 'src/services/http.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService implements OnInit, OnDestroy {
  // embassyList = new Subject<any>()

  private readonly _embassyList = new BehaviorSubject<any[]>([]);
  readonly embassyList$ = this._embassyList.asObservable();

  private readonly _visaCategory = new BehaviorSubject<any[]>([]);
  readonly visaCategory$ = this._visaCategory.asObservable();

  private readonly _visaType = new BehaviorSubject<any[]>([]);
  readonly visaType$ = this._visaType.asObservable();

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  getEmbassies() {
    this.httpService.get('Client/GetEmbassies').subscribe(response => {
      this._embassyList.next(response);
    });
  }

  getVisaCategory(embassyId: number) {
    this.httpService
      .get(`Client/GetVisaCategories/${embassyId}`)
      .subscribe(response => {
        this._visaCategory.next(response);
      });
  }

  getVisaType() {
    this.httpService.get('Client/GetVisaTypes').subscribe(response => {
      this._visaType.next(response);
    });
  }
}
