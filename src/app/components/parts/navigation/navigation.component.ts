import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  //#region コンストラクタ
  constructor(private router: Router) {

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

  //#region isSelected
  /**
   * 表示している画面が該当のメニューか判定する
   * @param itemName 
   * @returns 
   */
  public isSelected(itemName: string): boolean {
    return itemName === this.router.url.replace("/", "");
  }
  //#endregion

  //#endregion

}
