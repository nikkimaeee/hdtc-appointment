import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { first } from 'rxjs/operators';
import { faL, faUser } from '@fortawesome/free-solid-svg-icons';

import { AuthenticationService } from '@core/auth';
import { MessageService } from 'primeng/api';
import { ConfirmPasswordValidator } from '@app/core/validators/confirm-password.validator';
import { HttpService } from 'src/services/http.service';

@Component({
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading: boolean | undefined;
  submitted: boolean | undefined;
  error: string | undefined;
  faUser = faUser;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private httpSvc: HttpService
  ) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['admin']);
    }

    this.registerForm = this.formBuilder.group({
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', Validators.required],
      firstname: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)],
      ],
      lastname: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]],
      phone: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      isPwd: false,
      isSenior: false,
      isPregnant: false,
    });
  }

  ngOnInit() {
    this.loading = false;
    this.submitted = false;
    this.error = '';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  onShowPass() {
    this.showPassword = !this.showPassword;
    console.log(this.showPassword);
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched;
      return;
    }

    this.loading = true;

    this.httpSvc
      .post('Authenticate/Register', this.registerForm.getRawValue())
      .subscribe(
        response => {
          this.messageService.add({
            severity: response.status.toLowerCase(),
            summary: 'Sign up completed',
            detail: response.message,
          });

          this.loading = false;
          this.router.navigate(['']);
        },
        error => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Save Record',
            detail: error.error.message,
          });
        }
      );
  }

  validatePassword() {
    console.log('validate');
    if (
      this.registerForm.get('password')?.value ||
      this.registerForm.get('confirmPassword')?.value
    ) {
      this.registerForm
        .get('password')
        ?.setValidators([
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ]);
      this.registerForm.addValidators(
        ConfirmPasswordValidator(
          this.registerForm.get('password'),
          this.registerForm.get('confirmPassword')
        )
      );

      //workaround for not working validator, need to find other way
      if (this.registerForm.get('password')?.value.length < 8) {
        this.registerForm.get('password')?.setErrors({ pattern: true });
      }
    } else {
      this.registerForm
        .get('password')
        ?.setValidators([
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
          Validators.required,
        ]);
      this.registerForm.get('password')?.setErrors({ required: true });
      this.registerForm.addValidators(
        ConfirmPasswordValidator(
          this.registerForm.get('password'),
          this.registerForm.get('confirmPassword')
        )
      );
      if (
        this.registerForm.get('password')?.value.length > 0 &&
        this.registerForm.get('password')?.value !=
          this.registerForm.get('confirmPassword')?.value
      ) {
        this.registerForm
          .get('confirmPassword')
          ?.setErrors({ confirmPasswordValidator: true });
      } else {
        this.registerForm.get('confirmPassword')?.setErrors({ required: true });
      }
    }

    this.changeDetectorRef.detectChanges();
    this.registerForm.get('confirmPassword')?.markAsTouched;
    this.registerForm.get('password')?.markAsTouched;

    this.registerForm.updateValueAndValidity();
  }

  validateControl(controlName: string): boolean {
    if (
      (this.registerForm.get(controlName)?.dirty ||
        this.registerForm.get(controlName)?.touched) &&
      this.registerForm.get(controlName)?.invalid
    ) {
      return true;
    }
    return false;
  }
}
