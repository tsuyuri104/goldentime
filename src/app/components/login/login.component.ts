import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { getAuth } from 'firebase/auth';
import { RouteName } from 'src/app/classes/route-name';
import { InputsOfLogin } from 'src/app/interfaces/input-of-frm-login';
import { Notice } from 'src/app/interfaces/notice';
import { AuthService } from 'src/app/services/auth.service';
import { NoticesService } from 'src/app/services/notices.service';
import { VersionService } from 'src/app/services/version.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //#region 変数

  /**
   * ログイン入力項目
   */
  public login: InputsOfLogin = {
    email: "",
    password: ""
  }
  public notices: Notice[] = [];

  //#endregion

  //#region コンストラクタ
  constructor(private router: Router, private sAuth: AuthService, private sNotices: NoticesService, private sVersion: VersionService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  async ngOnInit(): Promise<void> {

    await this.getNotices();
    if (this.notices[0].version !== this.sVersion.version) {
      location.reload();
    }

  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region loginProcess
  /**
   * ログイン処理
   */
  public loginProcess(): void {
    this.sAuth.login(this.login.email, this.login.password)
      .then(() => {
        this.router.navigateByUrl(RouteName.OVERVIEW)
      })
      .catch((error) => {
        alert(error);
      });
  }
  //#endregion

  //#region getNotices
  /**
   * 更新情報を取得する
   */
  private async getNotices(): Promise<void> {

    this.notices = [];

    const snaps = await this.sNotices.getNotices();

    snaps.forEach((snap) => {
      this.notices.push(<Notice>snap.data());
    });
  }
  //#endregion

  //#endregion
}
