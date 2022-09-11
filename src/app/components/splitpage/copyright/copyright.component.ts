import { Component, OnInit } from '@angular/core';
import { Copyright } from 'src/app/interfaces/component/copyright';
import { CopyrightService } from 'src/app/services/copyright.service';

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.scss']
})
export class CopyrightComponent implements OnInit {

  public data: Copyright[] = [];

  //#region コンストラクタ
  constructor(private sCopyright: CopyrightService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  public ngOnInit(): void {
    this.sCopyright.getJson().subscribe(x => this.data = x);
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region open
  /**
   * 別タブで開く
   * @param url 
   */
  public open(url: string): void {
    window.open(url);
  }
  //#endregion

  //#endregion
}
