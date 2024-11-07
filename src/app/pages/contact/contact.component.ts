import {
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TopbarComponent } from '@app/shared/layout/topbar/topbar.component';
import { LayoutService } from '@app/shared/services/app.layout.service';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';
import { HttpService } from 'src/services/http.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  options: any;
  displayModal!: boolean;
  overlays!: any[];
  google: any;
  overlayMenuOpenSubscription!: Subscription;

  menuOutsideClickListener: any;

  profileMenuOutsideClickListener: any;

  @ViewChild(TopbarComponent) appTopbar!: TopbarComponent;

  constructor(
    private formBuilder: FormBuilder,
    private httpSvc: HttpService,
    private messageService: MessageService,
    public layoutService: LayoutService,
    public renderer: Renderer2
  ) {
    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      mobileNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });

    this.overlayMenuOpenSubscription =
      this.layoutService.overlayOpen$.subscribe(() => {
        if (!this.profileMenuOutsideClickListener) {
          this.profileMenuOutsideClickListener = this.renderer.listen(
            'document',
            'click',
            event => {
              const isOutsideClicked = !(
                this.appTopbar.menu.nativeElement.isSameNode(event.target) ||
                this.appTopbar.menu.nativeElement.contains(event.target) ||
                this.appTopbar.topbarMenuButton.nativeElement.isSameNode(
                  event.target
                ) ||
                this.appTopbar.topbarMenuButton.nativeElement.contains(
                  event.target
                ) ||
                this.appTopbar.menu.nativeElement.contains(event.target)
              );

              if (isOutsideClicked) {
                this.hideProfileMenu();
                this.hideMenu();
              }
            }
          );
        }

        if (this.layoutService.state.staticMenuMobileActive) {
          this.blockBodyScroll();
        }
      });
  }

  ngOnInit(): void {
    this.options = {
      center: { lat: 15.1800104, lng: 120.5759835 },
      zoom: 12,
    };

    this.overlays = [
      new google.maps.Marker({
        position: { lat: 15.190402, lng: 120.583765 },
        title: 'Dr. A.L. Ocampo Medical And Dental Clinic',
      }),
    ];
  }

  ngOnDestroy() {
    this.hideMenu();
    this.hideProfileMenu();
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener.unsubscribe();
    }
  }

  hideMenu() {
    this.layoutService.state.overlayMenuActive = false;
    this.layoutService.state.staticMenuMobileActive = false;
    this.layoutService.state.menuHoverActive = false;
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  hideProfileMenu() {
    this.layoutService.state.profileSidebarVisible = false;
    if (this.profileMenuOutsideClickListener) {
      this.profileMenuOutsideClickListener();
      this.profileMenuOutsideClickListener = null;
    }
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
    }
  }

  showDialog() {
    this.displayModal = true;
  }

  // Control Validator
  validateControl(controlName: string): boolean {
    if (
      (this.contactForm.get(controlName)?.dirty ||
        this.contactForm.get(controlName)?.touched) &&
      this.contactForm.get(controlName)?.invalid
    ) {
      return true;
    }
    return false;
  }

  submitForm() {
    let payload = this.contactForm.getRawValue();
    console.log(payload);
    this.httpSvc.post('Inquiries/SendInquiry', payload).subscribe(response => {
      this.messageService.add({
        severity: 'success',
        summary: 'Inquiry',
        detail: `Inquiry has been successfully sent.`,
      });

      this.contactForm.reset();
    });
  }
}
