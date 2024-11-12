import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { first } from 'rxjs/operators';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import { AuthenticationService } from '@core/auth';
import { MessageService } from 'primeng/api';
import { HttpService } from 'src/services/http.service';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean | undefined;
  submitted: boolean | undefined;
  error: string | undefined;
  faUser = faUser;
  showPassword: boolean = false;
  isVerified = true;
  isSubmitted = false;
  email: string = '';
  showResetForm: boolean = false;
  resetPassForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private httpSvc: HttpService
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['admin']);
    }

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.resetPassForm = this.formBuilder.group({
      email: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loading = false;
    this.submitted = false;
    this.error = '';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.isSubmitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authenticationService
      .login(
        this.loginForm.get('username')?.value,
        this.loginForm.get('password')?.value
      )
      .pipe(first())
      .subscribe({
        next: data => {
          if (!data.isVerified) {
            this.isVerified = false;
            this.email = data.username;
            this.authenticationService.logout();
          } else {
            // get return url from route parameters or default to '/'
            this.messageService.add({
              severity: 'success',
              summary: 'Logged In',
              detail: `Welcome ${data.firstName} ${data.lastName}`,
            });
            this.router.navigate(['admin']);
          }
        },
        error: error => {
          this.error =
            error.error.title === 'Unauthorized'
              ? 'Invalid Username/Password'
              : error.error.title;
          this.loading = false;
          this.isSubmitted = false;
        },
      });
  }

  resend() {
    let payload = {
      email: this.email,
    };
    this.httpSvc.post('Authenticate/Resend', payload).subscribe(response => {
      this.messageService.add({
        severity: 'success',
        summary: 'Email Verification',
        detail: `Email Verification Sent`,
      });
      this.router.navigate(['login']);
    });
  }

  resetForm() {
    this.loginForm.reset();
    this.isSubmitted = false;
    this.isVerified = true;
    this.submitted = false;
    this.loading = false;
    this.resetPassForm.reset();
    this.showResetForm = false;
  }

  resetPassword() {
    let payload = {
      email: this.resetPassForm.get('email')?.value,
    };
    this.httpSvc.post('Authenticate/ForgotPassword', payload).subscribe(
      response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Reset Password Link',
          detail: `Reset Password Link Sent. Please check your email`,
        });
        this.resetForm();
      },
      err => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Reset Password Link',
          detail: err.message,
        });
      }
    );
  }
}
