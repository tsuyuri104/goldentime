import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, getAuth, UserCredential, signOut } from 'firebase/auth';
import { Subject } from 'rxjs';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //#region 変数

  private sharedIsLoginedDataSource = new Subject<boolean>();

  public user: UserCredential | undefined;
  public sharedIsLoginedDataSource$ = this.sharedIsLoginedDataSource.asObservable();

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService) {

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
  public login(email: string, password: string): Promise<UserCredential | void> {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password)
      .then((u) => {
        this.user = u;
        this.sUrdayin.setSelectedUser(u);
        this.onSharedIsLoginedDateChanged(true);
      });
  }
  //#endregion

  //#region logout
  /**
   * ログアウトする
   * @returns 
   */
  public logout() {
    const auth = getAuth();
    return signOut(auth)
      .then(() => {
        this.user = undefined;
        this.onSharedIsLoginedDateChanged(false);
      });
  }
  //#endregion

}
