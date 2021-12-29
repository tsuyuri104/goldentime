import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { getAuth } from 'firebase/auth';
import { RouteName } from 'src/app/classes/route-name';
import { InputsOfLogin } from 'src/app/interfaces/input-of-frm-login';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //#region グローバル変数

  /**
   * ログイン入力項目
   */
  login: InputsOfLogin = {
    email: "",
    password: ""
  }

  //#endregion

  //#region コンストラクタ

  constructor(private router: Router, private sAuth: AuthService) {

  }

  //#endregion

  //#region イベント

  /**
   * 初期設定
   */
  ngOnInit(): void {

  }

  //#endregion

  //#region メソッド

  /**
   * ログイン処理
   */
  LoginProcess(): void {
    this.sAuth.login(this.login.email, this.login.password)
      .then(() => {
        this.router.navigateByUrl(RouteName.OVERVIEW)
      })
      .catch((error) => {
        alert(error);
      });
  }

  //#endregion
}
