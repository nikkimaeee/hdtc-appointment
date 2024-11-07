import {
  IAppointmentTime,
  IPatientInformation,
  ISchedule,
} from '@app/shared/interface';
import { createAction, props } from '@ngrx/store';

export const ResetAppointmentForm = createAction(
  '[Appointment Component] Reset ResetAppointmentForm'
);

export const UpdateAcceptedTerms = createAction(
  '[Notice Component] Update Accepted Terms',
  props<{ payload: boolean }>()
);

export const UpdateSchedule = createAction(
  '[Schedule Component] Update Schedule',
  props<{ payload: ISchedule }>()
);

export const UpdateTimeSlots = createAction(
  '[Schedule Component] Update Time Slots',
  props<{ payload: IAppointmentTime[] }>()
);

export const UpdatePatientInformation = createAction(
  '[Review Component] Update Patient Information',
  props<{ payload: IPatientInformation }>()
);
