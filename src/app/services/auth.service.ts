import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, getAuth, UserCredential, signOut } from 'firebase/auth';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //#region 変数

  public user: UserCredential | undefined;

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService) {

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
      });
  }
  //#endregion

}
