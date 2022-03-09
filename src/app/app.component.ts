import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ComponentControlService } from './services/component-control.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  //#region 変数

  public title = 'urdayin';

  //#endregion

  //#region コンストラクタ
  constructor() {

  }
  //#endregion


}
