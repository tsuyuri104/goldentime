import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteName } from 'src/app/classes/route-name';
import { AuthService } from 'src/app/services/auth.service';
import { VersionService } from 'src/app/services/version.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  //#region 変数

  public version = '';

  //#endregion

  //#region コンストラクタ
  constructor(private sAuth: AuthService, private sVersion: VersionService, private router: Router) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  ngOnInit(): void {
    this.version = this.sVersion.version;
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region logoutProcess
  /**
   * ログアウト処理
   */
  public logoutProcess() {
    this.sAuth.logout().then(() => {
      this.router.navigateByUrl(RouteName.LOGIN);
    });
  }
  //#endregion

  //#endregion

}
