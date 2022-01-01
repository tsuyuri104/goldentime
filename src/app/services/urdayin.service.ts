import { Injectable } from '@angular/core';
import { UserCredential } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { Urdayin } from '../interfaces/urdayin';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UrdayinService {

  //#region 変数

  private selectedUser: string = "";
  private selectedDate: Date = new Date;

  public readonly COLLECTION_NAME: string = "urdayin";

  //#endregion

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly USER_NAME: string = "user_name";
    public static readonly DAILY: string = 'daily';
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sAuth: AuthService) {
    this.selectedUser = this.sAuth.user === undefined ? "" : String(this.sAuth.user.user.email);
  }
  //#endregion

  //#region メソッド

  //#region getSelectedUser
  /**
   * 対象のユーザーを取得する
   * @returns ユーザーのメールアドレス
   */
  public getSelectedUser(): string {
    return this.selectedUser;
  }
  //#endregion

  //#region setSelectedUser
  /**
   * 対象のユーザーを設定する
   * @param user ユーザー情報
   */
  public setSelectedUser(user: UserCredential): void {
    this.selectedUser = String(user.user.email);
  }
  //#endregion

  //#region getSelectedDate
  /**
   * 対象の年月日を取得する
   * @returns 対象の年月日
   */
  public getSelectedDate(): Date {
    return this.selectedDate;
  }
  //#endregion

  //#region setSelectedDate
  /**
   * 対象の年月日を設定する
   * @param date 対象の年月日（日付型）
   */
  public setSelectedDate(date: Date): void {
    this.selectedDate = date;
  }
  //#endregion

  //#region getUserName
  /**
   * ユーザーの名前を取得する
   * @param email ユーザーのメールアドレス
   * @returns ユーザーの名前
   */
  public async getUserName(email: string): Promise<string> {
    const db = getFirestore();
    const docUser = doc(db, this.COLLECTION_NAME, email);
    const snapUser = await getDoc(docUser);

    return (<Urdayin>snapUser.data()).user_name;
  }
  //#endregion

  //#endregion
}