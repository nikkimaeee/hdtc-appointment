import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import { HttpService } from '@app/shared/services';
import {
  ConfirmationService,
  LazyLoadEvent,
  MessageService,
} from 'primeng/api';

@Component({
  selector: 'app-patient-record-details',
  templateUrl: './patient-record-details.component.html',
  styleUrls: ['./patient-record-details.component.scss'],
})
export class PatientRecordDetailsComponent implements OnInit {
  pageTitle: string | undefined;
  records: any[];
  isLoading: boolean = true;
  selectedRecord: any = {};
  totalRecords!: number;
  filter!: string;
  display: boolean = false;
  showUpdate: boolean = false;
  attachments: any[] = [];
  prescription: string = '';

  constructor(
    private httpSvc: HttpService,
    private messageService: MessageService,
    private authSvc: AuthenticationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute
  ) {
    this.records = [];
    this.filter = '';
  }

  get isAdmin(): boolean {
    return this.authSvc.currentUserValue.role.includes('Admin');
  }

  ngOnInit() {
    this.pageTitle = 'Patient Records Details';
    this.loadData();
  }

  loadData() {
    let id = this.route.snapshot.paramMap.get('id');
    this.httpSvc.get(`Admin/GetPatientRecordById/${id}`).subscribe(
      response => {
        this.records = response;
        this.isLoading = false;
      },
      err => {
        this.router.navigate(['/error']);
      }
    );
  }

  showDetails(item: any) {
    this.display = true;
    this.selectedRecord = item;
    console.log(item);
  }

  showUpdateModal(item: any) {
    this.showUpdate = true;
    this.selectedRecord = item;
    this.prescription = item.information.prescriptions;
  }

  uploadFile(event: any) {
    this.attachments = [];
    if (event.files && event.files.length > 0) {
      for (let file of event.files) {
        this.attachments.push(file);
      }
    }
  }

  updateAttachments() {
    const formData = new FormData();
    this.attachments.forEach(file => {
      formData.append('files[]', file);
    });
    formData.append('prescription', this.prescription);
    this.httpSvc
      .post(
        'Admin/UpdateAttachments/' + this.selectedRecord.information.id,
        formData
      )
      .subscribe(
        response => {
          this.messageService.add({
            severity: response.status.toLowerCase(),
            summary: 'Update Complete',
            detail: response.message,
          });
          this.loadData();
          this.showUpdate = false;
        },
        error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Mark as Done',
            detail: error.message,
          });
          this.showUpdate = false;
        }
      );
  }
}
