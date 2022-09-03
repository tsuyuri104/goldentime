import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, doc, getDoc, getDocs, getFirestore, query } from 'firebase/firestore';
import { Observable, of, Subject } from 'rxjs';
import { Urdayin } from '../interfaces/document/urdayin';

@Injectable({
  providedIn: 'root'
})
export class UrdayinService {

  //#region 変数

  private selectedUser: string = "";
  private selectedDate: Date = new Date;
  private sharedSelectedDateDataSource = new Subject<Date>();
  public sharedSelectedDateDataSource$ = this.sharedSelectedDateDataSource.asObservable();

  public readonly COLLECTION_NAME: string = "urdayin";

  //#endregion

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly USER_NAME: string = "user_name";
    public static readonly POSITION: string = "position";
  }
  public SUB_COLLECTION_NAME = class {
    public static readonly DAILY: string = 'daily';
    public static readonly MONTHLY: string = 'monthly';
    public static readonly GROUP_NAME: string = 'group_name'
  }

  //#endregion

  //#region コンストラクタ
  constructor(private angularFire: AngularFirestore) {
  }
  //#endregion

  //#region イベント

  //#region onSharedSelectedDateChanged
  /**
   * 対象日変更監視
   * @param date 
   */
  public onSharedSelectedDateChanged(date: Date): void {
    this.selectedDate = date;
    this.sharedSelectedDateDataSource.next(date);
  }
  //#endregion

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
   * @param email ユーザーのメールアドレス
   */
  public setSelectedUser(email: string): void {
    this.selectedUser = email;
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

  //#region 
  /**
   * ユーザー名を取得する
   * @param memberData 
   * @param email 
   * @returns 
   */
  public pickUpUserName(memberData: Urdayin[], email: string): string {
    return <string>memberData.find(x => x.email === email)?.user_name;
  }
  //#endregion

  //#region getMemberData
  /**
   * メンバー一覧を取得する
   * @returns 
   */
  public getMemberData(): Observable<Urdayin[]> {
    return this.angularFire.collectionGroup<Urdayin>(this.COLLECTION_NAME,
      ref => ref.where(this.FIELD_NAME.POSITION, "!=", "admin")
    ).valueChanges();
  }
  //#endregion

  //#endregion
}
