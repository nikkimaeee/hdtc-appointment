import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '@shared/shared.module';
import { AppRoutingModule } from '@app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { HomeComponent } from '@app/pages/home/home.component';
import { AppointmentComponent } from '@app/pages/appointment/appointment.component';
import { ReviewComponent, ScheduleComponent } from '@app/pages/appointment';
import { StoreModule } from '@ngrx/store';
import { appointmentPageReducer } from '@app/pages/appointment/store/appointment.reducer';
import { ErrorComponent } from '@app/pages/error/error.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { LoadingInterceptor } from '@core/interceptor';
import { SpinnerComponent } from './spinner/spinner.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { FooterComponent } from './shared/footer/footer.component';
import { JwtModule } from '@auth0/angular-jwt';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ServicesOfferedComponent } from './pages/admin/services-offered/services-offered.component';
import { ServicesFormComponent } from './pages/admin/services-offered/services-form/services-form.component';
import { CommaToLineBreak } from './core/pipes/commaToBreakline.pipe';
import { RegisterComponent } from './pages/register/register.component';
import { PaymentComponent } from './pages/appointment/payment/payment.component';
import { NgxPayPalModule } from 'ngx-paypal';
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

export function tokenGetter() {
  return localStorage.getItem('jwt');
}

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HomeComponent,
    AppointmentComponent,
    ScheduleComponent,
    ReviewComponent,
    LayoutComponent,
    ErrorComponent,
    SpinnerComponent,
    AboutComponent,
    ContactComponent,
    LoginComponent,
    DashboardComponent,
    ServicesOfferedComponent,
    ServicesFormComponent,
    CommaToLineBreak,
    RegisterComponent,
    PaymentComponent,
    AppointmentListComponent,
    AppointmentFormComponent,
    UsersComponent,
    UserFormComponent,
    ServiceCatalogComponent,
    EmailVerifyComponent,
    ProfileComponent,
    PatientRecordComponent,
    PatientRecordDetailsComponent,
    InquiryComponent,
    InquiryDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot({ appointment: appointmentPageReducer }),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [
          'localhost:44370',
          'hdc-api.runasp.net',
          'localhost:7230',
          'localhost:44338',
        ],
        disallowedRoutes: [],
      },
    }),
    NgxPayPalModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
