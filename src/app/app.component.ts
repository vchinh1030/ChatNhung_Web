import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ChatNhung_Web';
  constructor(
    private primengConfig: PrimeNGConfig
) { }

}
