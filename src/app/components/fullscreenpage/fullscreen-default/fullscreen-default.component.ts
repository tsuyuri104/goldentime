import { Component, OnInit } from '@angular/core';
import { ComponentControlService } from 'src/app/services/component-control.service';

@Component({
  selector: 'app-fullscreen-default',
  templateUrl: './fullscreen-default.component.html',
  styleUrls: ['./fullscreen-default.component.scss']
})
export class FullscreenDefaultComponent implements OnInit {

  constructor(private sComponentControl: ComponentControlService) { }

  ngOnInit(): void {
    // this.sComponentControl.onSharedIsContentPageChanged(false);
  }

  ngOnDestroy(): void {
    // this.sComponentControl.onSharedIsContentPageChanged(true);
  }

}
