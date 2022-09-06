import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { map, Observable } from 'rxjs';
import { Holiday } from '../interfaces/document/holiday';
import { DateUtil } from '../utilities/date-util';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  //#region 変数

  public readonly COLLECTION_NAME: string = "holiday";

  //#endregion

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly YEARMONTH: string = "yearmonth";
    public static readonly DATE: string = "date";
  }

  //#endregion

  //#region コンストラクタ
  constructor(private angularFire: AngularFirestore) {

  }
  //#endregion

  //#region メソッド

  //#region getHolidayData
  /**
   * 祝日データを取得する
   * @param yearmonth 
   * @param startYearMonth
   * @returns 
   */
  public getHolidayData(startYearMonth: string, endYearMonth: string): Observable<Holiday[]> {
    return this.angularFire.collection<Holiday>(this.COLLECTION_NAME,
      ref => ref.where(this.FIELD_NAME.YEARMONTH, ">=", startYearMonth)
        .where(this.FIELD_NAME.YEARMONTH, "<=", endYearMonth)
    ).valueChanges();
  }
  //#endregion

  //#region isHoliday
  /**
   * 祝日判定
   * @param date 
   * @returns 
   */
  public async isHoliday(date: Date): Promise<boolean> {

    const db = getFirestore();
    const ref = query(collection(db, this.COLLECTION_NAME), where(this.FIELD_NAME.DATE, "==", DateUtil.toString(date)));
    const snaps = await getDocs(ref);

    return snaps.docs.length > 0;
  }
  //#endregion

  //#endregion
}
