import { Component, OnInit } from '@angular/core';
import { LoaderService } from '@app/shared/services/';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  constructor(public loader: LoaderService) {}
}
