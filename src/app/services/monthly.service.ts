import { Injectable } from '@angular/core';
import { collection, doc, getDocs, getFirestore, query, QuerySnapshot, where, documentId, setDoc, getDoc, DocumentData, collectionGroup } from 'firebase/firestore';
import { Daily } from '../interfaces/document/daily';
import { Jobs } from '../interfaces/document/jobs';
import { Monthly } from '../interfaces/document/monthly';
import { SortType } from '../types/sort-type';
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
   * @param dailyData 対象の１ヶ月分の日次データ
   */
  public async updateMonthlyTotal(email: string, yearmonth: string, dailyData: QuerySnapshot<DocumentData>): Promise<void> {
    const db = getFirestore();
    const docRef = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.MONTHLY, yearmonth);

    let monthTotal: number = 0;

    //対象年月の日次データを取得する
    dailyData.forEach(snap => {
      const doc = <Daily>snap.data();
      monthTotal += doc.total;
    })

    const monthly: Monthly = {
      total: monthTotal,
      user: email,
      yearmonth: yearmonth,
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
    const jobs: Jobs[] = await this.sJobs.getDataOneMonth(email, yearmonth);
    jobs.forEach(job => {

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

    //作業名昇順でソート
    summaryData = this.sortSummary(summaryData, this.sJobs.FIELD_NAME.JOB, "asc");

    return summaryData;
  }
  //#endregion

  //#region sortSummary
  /**
   * サマリーデータをソートする
   * @param summaryData 
   * @param sortCol 作業内容か工数
   * @param sortType 昇順か降順
   * @returns 
   */
  public sortSummary(summaryData: Jobs[], sortCol: string, sortType: SortType): Jobs[] {

    //作業内容
    if (sortCol === this.sJobs.FIELD_NAME.JOB) {

      //昇順
      if (sortType === "asc") {
        summaryData.sort((a, b) => {
          return a.job > b.job ? 1 : -1;
        });
      }

      //降順
      if (sortType === "desc") {
        summaryData.sort((a, b) => {
          return a.job < b.job ? 1 : -1;
        });
      }
    }

    //工数
    if (sortCol === this.sJobs.FIELD_NAME.HOURS) {

      //昇順
      if (sortType === "asc") {
        summaryData.sort((a, b) => {
          return a.hours - b.hours;
        });
      }

      //降順
      if (sortType === "desc") {
        summaryData.sort((a, b) => {
          return b.hours - a.hours;
        });
      }
    }

    return summaryData;
  }
  //#endregion

  //#endregion
}
