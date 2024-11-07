import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentComponent } from './pages/appointment/appointment.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { ReviewComponent, ScheduleComponent } from './pages/appointment';
import { ErrorComponent } from './pages/error/error.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './pages/login/login.component';
import { LoginGuard } from './core/login';
import { AuthGuard } from './core/auth';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminLayoutComponent } from './shared/layout/layout.component';
import { ServicesOfferedComponent } from './pages/admin/services-offered/services-offered.component';
import { ServicesFormComponent } from './pages/admin/services-offered/services-form/services-form.component';
import { RegisterComponent } from './pages/register/register.component';
import { PaymentComponent } from './pages/appointment/payment/payment.component';
import { AppointmentListComponent } from './pages/admin/appointment-list/appointment-list.component';
import { AppointmentFormComponent } from './pages/admin/appointment-list/appointment-form/appointment-form.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { UserFormComponent } from './pages/admin/users/user-form/user-form.component';
import { ServiceCatalogComponent } from './pages/home/service-catalog/service-catalog.component';
import { EmailVerifyComponent } from './pages/email-verify/email-verify.component';
import { ProfileComponent } from './pages/admin/users/profile/profile.component';
import { PatientRecordComponent } from './pages/admin/patient-record/patient-record.component';
import { PatientRecordDetailsComponent } from './pages/admin/patient-record/patient-record-details/patient-record-details.component';
import { InquiryComponent } from './pages/admin/inquiry/inquiry.component';
import { InquiryDetailsComponent } from './pages/admin/inquiry/inquiry-details/inquiry-details.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
  },
  {
    path: 'appointment',
    component: AppointmentComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'schedule',
        pathMatch: 'full',
        data: { role: 'Patient' },
      },
      {
        path: 'schedule',
        component: ScheduleComponent,
        data: { role: 'Patient' },
      },
      { path: 'review', component: ReviewComponent, data: { role: 'Patient' } },
      {
        path: 'payment',
        component: PaymentComponent,
        data: { role: 'Patient' },
      },
    ],
  },
  {
    path: 'contact_us',
    component: ContactComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'service-catalog',
    component: ServiceCatalogComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'services/:action',
        component: ServicesFormComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'services/:action/:id',
        component: ServicesFormComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'services',
        component: ServicesOfferedComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'appointment-list',
        component: AppointmentListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'appointment-list/:action',
        component: AppointmentFormComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'appointment-list/:action/:id',
        component: AppointmentFormComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'users/:action',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'users/:action/:id',
        component: UserFormComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'patient-records/details/:id',
        component: PatientRecordDetailsComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'patient-records',
        component: PatientRecordComponent,
        canActivate: [AuthGuard],
        data: { role: 'Admin' },
      },
      {
        path: 'inquiries/details/:id',
        component: InquiryDetailsComponent,
        data: { role: 'Admin' },
      },
      {
        path: 'inquiries',
        component: InquiryComponent,
        data: { role: 'Admin' },
      },
    ],
  },
  {
    path: 'confirm',
    component: EmailVerifyComponent,
  },
  {
    path: '**',
    component: ErrorComponent, //add error page
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
