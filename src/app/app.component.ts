import { Component } from '@angular/core';
import { VersionService } from './services/version.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'urdayin';
  public version = '';

  constructor(private sVersion: VersionService) {
    this.version = this.sVersion.version;
  }
}
