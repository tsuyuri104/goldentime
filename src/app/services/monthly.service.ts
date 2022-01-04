import { Injectable } from '@angular/core';
import { collection, doc, getDocs, getFirestore, query, where, documentId, setDoc } from 'firebase/firestore';
import { Daily } from '../interfaces/daily';
import { Monthly } from '../interfaces/monthly';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class MonthlyService {

  //#region 変数

  public FIELD_NAME = class {
    public static readonly DATE: string = "date";
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region メソッド

  //#region updateMonthlyTotal
  /**
   * 月次データのトータルを更新する
   * @param email 対象ユーザーのメールアドレス
   * @param yearmonth 対象の年月
   */
  public async updateMonthlyTotal(email: string, yearmonth: string) {
    const db = getFirestore();
    const docRef = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.FIELD_NAME.MONTHLY, yearmonth);

    let monthTotal: number = 0;

    //対象年月の日次データを取得する
    const q = query(collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.FIELD_NAME.DAILY), where(documentId(), ">=", yearmonth + "01"), where(documentId(), "<=", yearmonth + "31"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id);
      const datum: Daily = <Daily>doc.data();
      monthTotal += datum.total;
    });

    const monthly: Monthly = {
      total: monthTotal,
    }

    await setDoc(docRef, monthly);
  }
  //#endregion

  //#endregion
}
