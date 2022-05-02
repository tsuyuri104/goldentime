import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.scss']
})
export class CopyrightComponent implements OnInit {

  //#region コンストラクタ
  constructor() {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  ngOnInit(): void {
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region open
  /**
   * 別タブで開く
   * @param event 
   */
  public open(event: Event): void {
    let elm: HTMLLinkElement = <HTMLLinkElement>event.target;
    const url: string = <string>elm.getAttribute("data-href");
    window.open(url);
  }
  //#endregion

  //#endregion
}
