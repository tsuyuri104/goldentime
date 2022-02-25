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
  public isContentPage: boolean = true;

  private subscriptionIsContentPage!: Subscription;

  //#endregion

  //#region コンストラクタ
  constructor(private sComponetCotrol: ComponentControlService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  ngOnInit(): void {
    this.subscriptionIsContentPage = this.sComponetCotrol.sharedIsContentPage$.subscribe(
      isContentPage => {
        this.isContentPage = isContentPage;
      }
    )
  }
  //#endregion

  //#region ngOnDestroy
  /**
   * 破棄設定
   */
  ngOnDestroy(): void {
    this.subscriptionIsContentPage.unsubscribe();
  }
  //#endregion

  //#endregion
}
