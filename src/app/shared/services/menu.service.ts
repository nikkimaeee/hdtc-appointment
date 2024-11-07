import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IMenuChangeEvent } from '@app/shared/interface';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuSource = new Subject<IMenuChangeEvent>();
  private resetSource = new Subject();

  menuSource$ = this.menuSource.asObservable();
  resetSource$ = this.resetSource.asObservable();

  onMenuStateChange(event: IMenuChangeEvent) {
    this.menuSource.next(event);
  }
  reset() {
    this.resetSource.next(true);
  }
}
