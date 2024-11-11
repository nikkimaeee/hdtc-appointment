import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/services/http.service';

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrls: ['./email-verify.component.scss'],
})
export class EmailVerifyComponent implements OnInit {
  showVerified: boolean = false;
  id!: string | null;
  token!: string | null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpSvc: HttpService
  ) {
    this.route.queryParams.subscribe(params => {
      this.id = params['user'];
      this.token = params['token'];
    });
  }

  ngOnInit(): void {
    if (!this.id || !this.token) {
      this.router.navigate(['/error']);
    }

    let payload = {
      userId: this.id,
      token: this.token,
    };

    this.httpSvc.post('Authenticate/Verify', payload).subscribe(
      response => {
        this.showVerified = true;
      },
      err => {
        this.router.navigate(['/error']);
      }
    );
  }
}
