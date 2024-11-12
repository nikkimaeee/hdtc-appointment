import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  MinLengthValidator,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmPasswordValidator } from '@app/core/validators/confirm-password.validator';
import { HttpService } from '@app/shared/services';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
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
    private changeDetectorRef: ChangeDetectorRef
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
    this.httpSvc.get('Admin/GetRoles').subscribe(response => {
      this.roles = response.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );
    });

    let id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.title = 'Edit User';
      this.isEdit = true;
      this.loadUserDetails(id);
    } else {
      this.userForm.addValidators(
        ConfirmPasswordValidator(
          this.userForm.get('password'),
          this.userForm.get('confirmPassword')
        )
      );
    }
  }

  loadUserDetails(id: string) {
    this.httpSvc.get(`Admin/GetUserById/${id}`).subscribe(response => {
      console.log(response);

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
    });
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

    let url = 'Admin/CreateUser';
    if (this.isEdit) {
      url = 'Admin/UpdateUser';
    }

    this.httpSvc.post(url, this.userForm.getRawValue()).subscribe(
      response => {
        this.messageService.add({
          severity: response.status.toLowerCase(),
          summary: 'Save Record',
          detail: response.message,
        });

        this.router.navigate(['admin/users']);
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
