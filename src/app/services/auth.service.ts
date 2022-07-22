import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subject } from 'rxjs';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //#region 変数

  private sharedIsLoginedDataSource = new Subject<boolean>();

  public user: firebase.default.auth.UserCredential | null = null;
  public sharedIsLoginedDataSource$ = this.sharedIsLoginedDataSource.asObservable();

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService, private angularAuth: AngularFireAuth) {

  }
  //#endregion

  //#region onSharedIsLoginedDateChanged
  /**
   * 監視対象
   * ログインしているか判定
   * @param isLogined 
   */
  public onSharedIsLoginedDateChanged(isLogined: boolean): void {
    this.sharedIsLoginedDataSource.next(isLogined);
  }
  //#endregion

  //#region login
  /**
   * ログインする
   * @param email 
   * @param password 
   * @returns 
   */
  public login(email: string, password: string): Promise<firebase.default.auth.UserCredential | void> {
    return this.angularAuth.signInWithEmailAndPassword(email, password).then(u => {
      this.user = u;
      this.sUrdayin.setSelectedUser(String(u.user?.email));
      this.onSharedIsLoginedDateChanged(true);
    })
  }
  //#endregion

  //#region logout
  /**
   * ログアウトする
   * @returns 
   */
  public logout(): Promise<void> {
    return this.angularAuth.signOut().then(res => {
      this.sUrdayin.setSelectedUser("");
    });
  }
  //#endregion

}
