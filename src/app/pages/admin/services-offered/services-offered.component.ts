import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/core/auth';
import { IProduct } from '@app/shared/interface/product.interface';
import { HttpService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { faBars, faBell, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-services',
  templateUrl: './services-offered.component.html',
  styleUrls: ['./services-offered.component.scss'],
})
export class ServicesOfferedComponent implements OnInit {
  pageTitle: string | undefined;
  products: IProduct[];
  isLoading: boolean = true;
  filter!: string;

  constructor(
    private httpSvc: HttpService,
    private messageService: MessageService,
    private authSvc: AuthenticationService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private _sanitizer: DomSanitizer
  ) {
    this.products = [];
  }

  ngOnInit() {
    this.pageTitle = 'Services Offered';
    this.loadProducts();
  }

  addNew() {
    this.router.navigate(['admin/services/new']);
  }

  loadProducts() {
    this.httpSvc.get(`Admin/GetServices`).subscribe(response => {
      this.products = response;
      this.isLoading = false;
    });
  }

  editItem(product: IProduct) {
    this.router.navigate([`admin/services/edit/${product.id}`]);
  }

  deleteItem(product: IProduct) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete selected record?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpSvc.delete(`Admin/DeleteProduct`, product.id).subscribe(
          response => {
            this.messageService.add({
              severity: response.status.toLowerCase(),
              summary: 'Delete Record',
              detail: response.message,
            });
            this.loadProducts();
          },
          error => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Record',
              detail: error.message,
            });
          }
        );
      },
    });
  }
}
