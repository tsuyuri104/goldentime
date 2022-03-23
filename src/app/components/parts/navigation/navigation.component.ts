import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  public contactFormUrl: string = "";

  //#region コンストラクタ
  constructor(private router: Router, private sConfig: ConfigService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  ngOnInit(): void {
    this.contactFormUrl = this.sConfig.contactFormUrl;
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
