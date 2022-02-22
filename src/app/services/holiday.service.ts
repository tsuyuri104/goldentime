import { Injectable } from '@angular/core';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { Holiday } from '../interfaces/document/holiday';

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

  //#endregion
}
