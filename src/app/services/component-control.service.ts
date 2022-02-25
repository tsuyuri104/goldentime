import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentControlService {

  //#region 変数

  private sharedIsContentPage = new Subject<boolean>();

  public sharedIsContentPage$ = this.sharedIsContentPage.asObservable();

  //#endregion

  //#region コンストラクタ
  constructor() {

  }
  //#endregion

  //#region  イベント

  //#region onSharedIsContentPageChanged
  /**
   * 表示しているページがコンテンツページか判定を監視
   * @param data 
   */
  public onSharedIsContentPageChanged(data: boolean): void {
    this.sharedIsContentPage.next(data);
  }
  //#endregion

  //#endregion
}
