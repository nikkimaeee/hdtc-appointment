import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import { IProduct } from '@app/shared/interface/product.interface';
import { HttpService } from '@app/shared/services';
import { environment } from '@environments/environment';
import {
  faBars,
  faBell,
  faChartLine,
  faPause,
} from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-services-form',
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.scss'],
})
export class ServicesFormComponent implements OnInit {
  title = 'Create New Service';
  isEdit = false;
  productForm: FormGroup;
  selectedThumbnail!: string;

  @ViewChild('fileUpload')
  fileUpload!: FileUpload;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private httpSvc: HttpService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    this.productForm = this.fb.group({
      id: 0,
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, Validators.min(1)],
      duration: [0, Validators.min(1)],
      thumbnail: new FormControl(),
    });
  }

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.title = 'Edit Service';
      this.isEdit = true;
      this.loadProductDetails(id);
    }
  }

  loadProductDetails(id: any) {
    this.httpSvc.get(`Admin/GetServicesById/${id}`).subscribe(response => {
      this.productForm.patchValue({
        id: response.id,
        name: response.name,
        code: response.code,
        description: response.description,
        price: response.price,
        duration: response.duration,
      });

      this.selectedThumbnail = response.image;

      if (response.image) {
        this.fileUpload.clear();
        let blob: any = null;
        blob = new Blob([response.image], { type: 'image/jpeg' });
        blob.objectURL = this.sanitizer.bypassSecurityTrustUrl(
          'data:image/jpg;base64,' + response.image
        );
        blob.name =
          response.imageFileName.length > 0
            ? response.imageFileName
            : response.name;
        this.fileUpload.files.push(blob);
        this.productForm.patchValue({
          thumbnail: this.fileUpload.files,
        });
      }
    });
  }

  dataURItoBlob(dataURI: string) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  save() {
    let payload = {
      ...this.productForm.getRawValue(),
    };

    const formData = new FormData();
    formData.append('id', payload.id);
    formData.append('name', payload.name);
    formData.append('code', payload.code);
    formData.append('description', payload.description);
    formData.append('price', payload.price);
    formData.append('duration', payload.duration);
    formData.append('thumbnail', payload.thumbnail);

    let url = 'Admin/CreateService';
    if (this.isEdit) {
      url = 'Admin/UpdateService';
    }

    this.httpSvc.post(url, formData).subscribe(
      response => {
        this.messageService.add({
          severity: response.status.toLowerCase(),
          summary: 'Save Record',
          detail: response.message,
        });

        this.router.navigate(['admin/services']);
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

  validateControl(controlName: string): boolean {
    if (
      (this.productForm.get(controlName)?.dirty ||
        this.productForm.get(controlName)?.touched) &&
      this.productForm.get(controlName)?.invalid
    ) {
      return true;
    }
    return false;
  }

  uploadFile(event: any) {
    for (let file of event.files) {
      this.productForm.patchValue({ thumbnail: file });
      this.productForm.get('thumbnail')?.updateValueAndValidity();
    }
  }
}
