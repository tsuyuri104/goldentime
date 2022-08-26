import { Injectable } from '@angular/core';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
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
  constructor() {

  }
  //#endregion

  //#region メソッド

  //#region getHolidayData
  /**
   * 祝日データを取得する
   * @param yearmonth 
   * @returns 
   */
  public async getHolidayData(yearmonth: string): Promise<string[]> {
    let data: string[] = [];

    const db = getFirestore();
    const ref = query(collection(db, this.COLLECTION_NAME), where(this.FIELD_NAME.YEARMONTH, "==", yearmonth));
    const snaps = await getDocs(ref);

    snaps.forEach(snap => {
      data.push((<Holiday>snap.data()).date);
    });

    return data;
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
