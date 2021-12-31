import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, getAuth, UserCredential } from 'firebase/auth'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user: any;

  //#region コンストラクタ

  constructor() {

  }

  //#endregion

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
      });
  }
}
