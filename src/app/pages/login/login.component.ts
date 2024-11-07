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

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['admin']);
    }

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
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
          // get return url from route parameters or default to '/'
          this.messageService.add({
            severity: 'success',
            summary: 'Logged In',
            detail: `Welcome ${data.firstName} ${data.lastName}`,
          });
          this.router.navigate(['admin']);
        },
        error: error => {
          this.error =
            error.error.title === 'Unauthorized'
              ? 'Invalid Username/Password'
              : error.error.title;
          this.loading = false;
        },
      });
  }
}
