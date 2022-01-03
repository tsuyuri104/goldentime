import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteName } from 'src/app/classes/route-name';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  //#region コンストラク
  constructor(private sAuth: AuthService, private router: Router) {

  }
  //#endregion

  //#region イベント

  //#region  ngOnInit
  ngOnInit(): void {

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
