import { IAppointment } from '@app/shared/interface';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectAppointment =
  createFeatureSelector<IAppointment>('appointment');

export const selectRecord = createSelector(
  selectAppointment,
  (state: IAppointment) => state
);
