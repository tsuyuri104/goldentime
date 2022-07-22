import { Injectable } from '@angular/core';
import { UserCredential } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { DailyKeyValue } from '../interfaces/document/daily-key-value';
import { Jobs } from '../interfaces/document/jobs';
import { Monthly } from '../interfaces/document/monthly';
import { Urdayin } from '../interfaces/document/urdayin';

@Injectable({
  providedIn: 'root'
})
export class UrdayinService {

  //#region 変数

  private selectedUser: string = "";
  private selectedDate: Date = new Date;
  private sharedMonthlyDataSource = new Subject<Monthly>();
  private sharedSummaryDataSource = new Subject<Jobs[]>();
  private sharedDailysDataSource = new Subject<DailyKeyValue>();
  private sharedSelectedDateDataSource = new Subject<Date>();

  public readonly COLLECTION_NAME: string = "urdayin";
  public sharedMonthlyDataSource$ = this.sharedMonthlyDataSource.asObservable();
  public sharedSummaryDataSource$ = this.sharedSummaryDataSource.asObservable();
  public sharedDailysDataSource$ = this.sharedDailysDataSource.asObservable();
  public sharedSelectedDateDataSource$ = this.sharedSelectedDateDataSource.asObservable();

  //#endregion

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly USER_NAME: string = "user_name";
  }
  public SUB_COLLECTION_NAME = class {
    public static readonly DAILY: string = 'daily';
    public static readonly MONTHLY: string = 'monthly';
    public static readonly GROUP_NAME: string = 'group_name'
  }

  //#endregion

  //#region コンストラクタ
  constructor() {
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
  public onSharedDailyDataChanged(data: DailyKeyValue): void {
    this.sharedDailysDataSource.next(data);
  }
  //#endregion

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
  public async getMemberData(): Promise<Urdayin[]> {
    let data: Urdayin[] = [];

    const db = getFirestore();
    const ref = query(collection(db, this.COLLECTION_NAME));
    const snaps = await getDocs(ref);

    snaps.forEach(snap => {
      data.push(<Urdayin>snap.data());
    });

    return data;
  }
  //#endregion

  //#endregion
}
