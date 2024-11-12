import { IAppointmentTime } from './appointmentTime.interface';

export interface IAppointment {
  schedule: ISchedule;
  timeSlots: IAppointmentTime[];
  personalInformation: IPatientInformation;
}

export interface ISchedule {
  product: number;
  appointmentDate: string;
  appointmentTime: number;
  price: number;
}

export interface IPatientInformation {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  isPwd?: boolean;
  isSenior?: boolean;
  isPregnant?: boolean;
  medCert?: any;
}

export interface IAppointmentTable {
  id?: number;
  referenceNumber?: string;
  status?: number;
  appointmentDate?: string;
  appointmentTime?: IAppointmentTime[];
  aspNetUserId?: string;
  transactionId: string;
  paymentMethod?: number;
  isPaid?: boolean;
  isWalkIn?: boolean;
  hmoReference?: string;
  patientInformation: IPatientInformation;
  appointmentTimeLabel: string;
  isPwd?: boolean;
  isPregnant?: boolean;
  isSenior?: boolean;
}
