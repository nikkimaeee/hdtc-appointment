export interface IAppointmentTime {
  id: number;
  name: string;
  availableSlot: number;
  militaryTime: number;
  from?: string;
  to?: string;
}
