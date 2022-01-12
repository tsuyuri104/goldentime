import { Injectable } from '@angular/core';
import { UserCredential } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { Dailys } from '../interfaces/dailys';
import { Jobs } from '../interfaces/jobs';
import { Monthly } from '../interfaces/monthly';
import { Urdayin } from '../interfaces/urdayin';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UrdayinService {

  //#region 変数

  private selectedUser: string = "";
  private selectedDate: Date = new Date;
  private sharedMonthlyDataSource = new Subject<Monthly>();
  private sharedSummaryDataSource = new Subject<Jobs[]>();
  private sharedDailysDataSource = new Subject<Dailys>();

  public readonly COLLECTION_NAME: string = "urdayin";
  public sharedMonthlyDataSource$ = this.sharedMonthlyDataSource.asObservable();
  public sharedSummaryDataSource$ = this.sharedSummaryDataSource.asObservable();
  public sharedDailysDataSource$ = this.sharedDailysDataSource.asObservable();

  //#endregion

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly USER_NAME: string = "user_name";
    public static readonly DAILY: string = 'daily';
    public static readonly MONTHLY: string = 'monthly';
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sAuth: AuthService) {
    this.setSelectedUser(this.sAuth.user);
  }
  //#endregion

  //#region イベント

  //#region onSharedMonthlyDataChanged
  /**
   * 月次データ変更監視
   * @param data 月次データ
   */
  public onSharedMonthlyDataChanged(data: Monthly): void {
    this.sharedMonthlyDataSource.next(data);
  }
  //#endregion

  //#region onSharedSummaryDataChanged
  /**
   * サマリーデータ変更監視
   * @param data 
   */
  public onSharedSummaryDataChanged(data: Jobs[]): void {
    this.sharedSummaryDataSource.next(data);
  }
  //#endregion

  //#region onSharedDailyDataChanged
  /**
   * １ヶ月の日次データ変更監視
   * @param data 
   */
  public onSharedDailyDataChanged(data: Dailys): void {
    this.sharedDailysDataSource.next(data);
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
   * @param user ユーザー情報
   */
  public setSelectedUser(user: UserCredential | undefined): void {
    if (user === undefined) {
      this.selectedUser = "";
    } else {
      this.selectedUser = String(user.user.email);
    }
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
