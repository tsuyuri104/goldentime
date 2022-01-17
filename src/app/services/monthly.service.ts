import { Injectable } from '@angular/core';
import { collection, doc, getDocs, getFirestore, query, where, documentId, setDoc, getDoc, DocumentData, collectionGroup } from 'firebase/firestore';
import { Daily } from '../interfaces/daily';
import { Jobs } from '../interfaces/jobs';
import { Monthly } from '../interfaces/monthly';
import { DailyService } from './daily.service';
import { JobsService } from './jobs.service';
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
  constructor(private sUrdayin: UrdayinService, private sDaily: DailyService, private sJobs: JobsService) {

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

    //1ヶ月分の仕事データを取得する
    const db = getFirestore();
    const q = query(collectionGroup(db, this.sDaily.SUB_COLLECTION_NAME.JOBS), where(this.sJobs.FIELD_NAME.USER, "==", email), where(this.sJobs.FIELD_NAME.DATE, ">=", yearmonth + "01"), where(this.sJobs.FIELD_NAME.DATE, "<=", yearmonth + "31"));
    const docs = await getDocs(q);
    docs.forEach(doc => {
      const job = <Jobs>doc.data();
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

    return summaryData;
  }
  //#endregion

  //#endregion
}
