import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteName } from './classes/route-name';
import { AuthService } from './services/auth.service';
import { VersionService } from './services/version.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  //#region 変数

  public title = 'urdayin';
  public version = '';
  public isLogined: boolean = false;

  private subscriptionIsLogined!: Subscription;

  //#endregion

  //#region コンストラクタ
  constructor(private sVersion: VersionService, private sAuth: AuthService, private router: Router) {
    this.version = this.sVersion.version;
  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  ngOnInit(): void {
    //監視対象の設定
    this.subscriptionIsLogined = this.sAuth.sharedIsLoginedDataSource$.subscribe(
      isLogined => {
        this.isLogined = isLogined;
      }
    );
  }
  //#endregion

  //#region ngOnDestroy
  /**
   * 破棄設定
   */
  ngOnDestroy(): void {
    this.subscriptionIsLogined.unsubscribe();
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
