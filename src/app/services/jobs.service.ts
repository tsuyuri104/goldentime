import { Injectable } from '@angular/core';
import { collection, DocumentData, getDocs, getFirestore, query, QuerySnapshot } from 'firebase/firestore';
import { DailyService } from './daily.service';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class JobsService {

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly DATE: string = "date";
    public static readonly USER: string = "user";
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService, private sDaily: DailyService) {

  }
  //#endregion

  //#region メソッド

  //#region getData
  /**
   * 仕事データを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param date 対象の年月日
   * @returns 仕事データ
   */
  public async getData(email: string, date: string): Promise<QuerySnapshot<DocumentData>> {
    const db = getFirestore();
    const q = query(collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date, this.sDaily.SUB_COLLECTION_NAME.JOBS));
    return await getDocs(q);
  }
  //#endregion

  //#endregion
}
