import { Injectable } from '@angular/core';
import { collection, doc, getDocs, getFirestore, query, where, documentId, setDoc, getDoc, DocumentData } from 'firebase/firestore';
import { Daily } from '../interfaces/daily';
import { Jobs } from '../interfaces/jobs';
import { Monthly } from '../interfaces/monthly';
import { DailyService } from './daily.service';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class MonthlyService {

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly DATE: string = "date";
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService, private sDaily: DailyService) {

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
    const docRef = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.MONTHLY, yearmonth);

    let monthTotal: number = 0;

    //対象年月の日次データを取得する
    const dailyData = await this.sDaily.getDataOneMonth(email, yearmonth);
    dailyData.forEach(snap => {
      const doc = <Daily>snap.data();
      monthTotal += doc.total;
    })

    const monthly: Monthly = {
      total: monthTotal,
    }

    await setDoc(docRef, monthly);
  }
  //#endregion

  //#region getMonthlyData
  /**
   * 月次データを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param yearmonth 対象の年月
   * @returns 月次データ
   */
  public async getMonthlyData(email: string, yearmonth: string): Promise<DocumentData | undefined> {
    const db = getFirestore();
    const ref = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.MONTHLY, yearmonth);
    const snap = await getDoc(ref);
    return snap.data();
  }
  //#endregion

  //#region getSummaryData
  /**
   * サマリーデータを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param yearmonth 対象の年月
   * @returns 工数のサマリーデータ
   */
  public async getSummaryData(email: string, yearmonth: string): Promise<Jobs[]> {

    //サマリーデータ格納用変数
    let summaryData: Jobs[] = [];

    //1ヶ月分の日次データを取得する
    const db = getFirestore();
    const q = query(collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY), where(documentId(), ">=", yearmonth + "01"), where(documentId(), "<=", yearmonth + "31"));
    let docs = await getDocs(q);

    docs.forEach(async doc => {
      //日にち単位で仕事データを取得する
      const q2 = query(collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, doc.id, this.sDaily.SUB_COLLECTION_NAME.JOBS));
      const docs2 = await getDocs(q2);

      //仕事データからサマリーデータを作成する
      docs2.forEach(doc2 => {
        const job = <Jobs>doc2.data();
        const indexData = summaryData.findIndex(datum => datum.job === job.job);
        const hasData = indexData > -1;
        if (hasData) {
          //加算
          summaryData[indexData].hours += job.hours;
        } else {
          //追加
          summaryData.push(job);
        }
      });
    });

    return summaryData;
  }
  //#endregion

  //#endregion
}
