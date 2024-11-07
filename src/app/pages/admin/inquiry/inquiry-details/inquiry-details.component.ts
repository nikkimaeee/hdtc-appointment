import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import { HttpService } from '@app/shared/services';
import {
  ConfirmationService,
  LazyLoadEvent,
  MessageService,
} from 'primeng/api';

@Component({
  selector: 'app-inquiry-details',
  templateUrl: './inquiry-details.component.html',
  styleUrls: ['./inquiry-details.component.scss'],
})
export class InquiryDetailsComponent implements OnInit {
  pageTitle: string | undefined;
  record: any;
  isLoading: boolean = true;
  selectedRecord: any = {};
  totalRecords!: number;
  filter!: string;
  display: boolean = false;
  inquiryForm: FormGroup;

  constructor(
    private httpSvc: HttpService,
    private messageService: MessageService,
    private authSvc: AuthenticationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.record = null;
    this.filter = '';
    this.inquiryForm = this.fb.group({
      id: '',
      message: ['', Validators.required],
    });
  }

  get isAdmin(): boolean {
    return this.authSvc.currentUserValue.role.includes('Admin');
  }

  ngOnInit() {
    this.pageTitle = 'Inquiry Details';
    this.loadData();
  }

  loadData() {
    let id = this.route.snapshot.paramMap.get('id');
    this.httpSvc.get(`Inquiries/GetInquiriesById/${id}`).subscribe(
      response => {
        this.record = response;
        this.inquiryForm.patchValue({
          id: id,
        });
        this.isLoading = false;
      },
      err => {
        this.router.navigate(['/error']);
      }
    );
  }

  // Control Validator
  validateControl(controlName: string): boolean {
    if (
      (this.inquiryForm.get(controlName)?.dirty ||
        this.inquiryForm.get(controlName)?.touched) &&
      this.inquiryForm.get(controlName)?.invalid
    ) {
      return true;
    }
    return false;
  }

  submitForm() {
    let payload = this.inquiryForm.getRawValue();
    this.httpSvc.post('Inquiries/CompleteInquiry', payload).subscribe(
      response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Inquiry',
          detail: `Inquiry has been successfully Completed.`,
        });
      },
      err => {
        this.messageService.add({
          severity: 'warning',
          summary: 'Inquiry',
          detail: `There was an error processing request`,
        });
      }
    );
  }
}
