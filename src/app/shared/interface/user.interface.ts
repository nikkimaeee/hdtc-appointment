import { IPatientInformation } from './appointment.interface';

export interface IUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  token?: string;
  role: string[];
  patientInformation?: IPatientInformation;
  lastLogin: string;
}
