import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import { ConfirmPasswordValidator } from '@app/core/validators/confirm-password.validator';
import { HttpService } from '@app/shared/services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  roles: any;
  userForm: FormGroup;
  password: string = '';
  isEdit = false;
  branches: any;
  title = 'Create User';

  constructor(
    private fb: FormBuilder,
    private httpSvc: HttpService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private authSvc: AuthenticationService
  ) {
    this.userForm = this.fb.group({
      firstName: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)],
      ],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/),
        ],
      ],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required],
      phone: ['', Validators.required],
      isPwd: false,
      isPregnant: false,
      isSenior: false,
      userId: '',
    });
  }

  get f() {
    return this.userForm.controls;
  }

  ngOnInit(): void {
    this.title = 'Edit Profile';
    this.isEdit = true;
    this.loadUserDetails();
  }

  loadUserDetails() {
    this.httpSvc.get(`Admin/GetProfile`).subscribe(
      response => {
        this.userForm.patchValue({
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.userName,
          role: response.role,
          phone: response.phone,
          isPwd: response.isPwd,
          isPregnant: response.isPregnant,
          isSenior: response.isSenior,
          userId: response.userId,
        });

        this.userForm.get('password')?.setValidators(null);
        this.userForm.get('password')?.setErrors(null);
        this.userForm.get('confirmPassword')?.setValidators(null);
        this.userForm.get('confirmPassword')?.setErrors(null);
        this.userForm.get('email')?.disable();

        this.userForm.updateValueAndValidity();
      },
      err => {
        this.router.navigate(['/error']);
      }
    );
  }

  validateControl(controlName: string): boolean {
    if (
      (this.userForm.get(controlName)?.dirty ||
        this.userForm.get(controlName)?.touched) &&
      this.userForm.get(controlName)?.invalid
    ) {
      return true;
    }
    return false;
  }

  save(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched;
      return;
    }

    let firstname = this.userForm.get('firstName')?.value;
    let lastName = this.userForm.get('lastName')?.value;
    let email = this.userForm.get('email')?.value;
    this.httpSvc
      .post('Admin/UpdateUser', this.userForm.getRawValue())
      .subscribe(
        response => {
          this.authSvc.updateUser(firstname, lastName, email);
          this.messageService.add({
            severity: response.status.toLowerCase(),
            summary: 'Save Record',
            detail: response.message,
          });

          this.router.navigate(['admin']);
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Save Record',
            detail: error.error.message,
          });
        }
      );
  }

  changePassword() {
    //console.log(event.target.value)
    if (!this.isEdit) {
      return;
    }

    if (
      this.userForm.get('password')?.value ||
      this.userForm.get('confirmPassword')?.value
    ) {
      this.userForm
        .get('password')
        ?.setValidators([
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/),
        ]);
      this.userForm.addValidators(
        ConfirmPasswordValidator(
          this.userForm.get('password'),
          this.userForm.get('confirmPassword')
        )
      );

      //workaround for not working validator, need to find other way
      if (this.userForm.get('password')?.value.length < 8) {
        this.userForm.get('password')?.setErrors({ pattern: true });
      }
    } else {
      this.userForm.get('password')?.setValidators(null);
      this.userForm.get('password')?.setErrors(null);
      this.userForm.get('confirmPassword')?.setValidators(null);
      this.userForm.get('confirmPassword')?.setErrors(null);
    }

    this.changeDetectorRef.detectChanges();
    this.userForm.markAllAsTouched();

    this.userForm.updateValueAndValidity();
  }

  OnCheckBoxCheck(event: any, controlName: string) {
    if (controlName == 'isPwd' && event.checked) {
      this.userForm.patchValue({
        isPwd: true,
        isPregnant: false,
        isSenior: false,
      });
    } else if (controlName == 'isPregnant' && event.checked) {
      this.userForm.patchValue({
        isPwd: false,
        isPregnant: true,
        isSenior: false,
      });
    } else if (controlName == 'isSenior' && event.checked) {
      this.userForm.patchValue({
        isPwd: false,
        isPregnant: false,
        isSenior: true,
      });
    }
  }
}
