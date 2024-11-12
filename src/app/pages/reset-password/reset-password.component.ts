import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { ConfirmPasswordValidator } from '@app/core/validators/confirm-password.validator';

@Component({
  templateUrl: 'reset-password.component.html',
  styleUrls: ['reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
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
  showConfirmPassword: boolean = false;
  id: string = '';
  token: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private httpSvc: HttpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe(params => {
      this.id = params['user'];
      this.token = params['token'];
    });

    this.resetPassForm = this.formBuilder.group({
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (!this.id || !this.token) {
      this.router.navigate(['/error']);
    }

    this.loading = false;
    this.submitted = false;
    this.error = '';
  }

  resetForm() {
    this.isSubmitted = false;
    this.isVerified = true;
    this.submitted = false;
    this.loading = false;
    this.resetPassForm.reset();
    this.showResetForm = false;
  }

  resetPassword() {
    let payload = {
      userId: this.id,
      token: this.token,
      password: this.resetPassForm.get('password')?.value,
    };
    this.httpSvc.post('Authenticate/ResetPassword', payload).subscribe(
      response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Reset Password',
          detail: `Password Reset Successfully`,
        });
        this.router.navigate(['/login']);
      },
      err => {
        this.messageService.add({
          severity: 'danger',
          summary: 'Reset Password',
          detail: err.message,
        });
        this.router.navigate(['/error']);
      }
    );
  }

  validatePassword() {
    console.log('validate');
    if (
      this.resetPassForm.get('password')?.value ||
      this.resetPassForm.get('confirmPassword')?.value
    ) {
      this.resetPassForm
        .get('password')
        ?.setValidators([
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/),
        ]);
      this.resetPassForm.addValidators(
        ConfirmPasswordValidator(
          this.resetPassForm.get('password'),
          this.resetPassForm.get('confirmPassword')
        )
      );

      //workaround for not working validator, need to find other way
      if (this.resetPassForm.get('password')?.value.length < 8) {
        this.resetPassForm.get('password')?.setErrors({ pattern: true });
      }
    } else {
      this.resetPassForm
        .get('password')
        ?.setValidators([
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/),
          Validators.required,
        ]);
      this.resetPassForm.get('password')?.setErrors({ required: true });
      this.resetPassForm.addValidators(
        ConfirmPasswordValidator(
          this.resetPassForm.get('password'),
          this.resetPassForm.get('confirmPassword')
        )
      );
      if (
        this.resetPassForm.get('password')?.value.length > 0 &&
        this.resetPassForm.get('password')?.value !=
          this.resetPassForm.get('confirmPassword')?.value
      ) {
        this.resetPassForm
          .get('confirmPassword')
          ?.setErrors({ confirmPasswordValidator: true });
      } else {
        this.resetPassForm
          .get('confirmPassword')
          ?.setErrors({ required: true });
      }
    }

    this.changeDetectorRef.detectChanges();
    this.resetPassForm.get('confirmPassword')?.markAsTouched;
    this.resetPassForm.get('password')?.markAsTouched;

    this.resetPassForm.updateValueAndValidity();
  }

  validateControl(controlName: string): boolean {
    if (
      (this.resetPassForm.get(controlName)?.dirty ||
        this.resetPassForm.get(controlName)?.touched) &&
      this.resetPassForm.get(controlName)?.invalid
    ) {
      return true;
    }
    return false;
  }
}
