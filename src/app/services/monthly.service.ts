import { Injectable } from '@angular/core';
import { collection, doc, getDocs, getFirestore, query, QuerySnapshot, where, documentId, setDoc, getDoc, DocumentData, collectionGroup } from 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Daily } from '../interfaces/document/daily';
import { Jobs } from '../interfaces/document/jobs';
import { Monthly } from '../interfaces/document/monthly';
import { JobsService } from './jobs.service';
import { UrdayinService } from './urdayin.service';
import { Fire } from '../utilities/fire';

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
  constructor(private sUrdayin: UrdayinService, private sJobs: JobsService, private angularFire: AngularFirestore) {

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
  public async updateMonthlyTotal(email: string, yearmonth: string, dailyData: Daily[]): Promise<void> {
    const db = getFirestore();
    const docRef = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.MONTHLY, yearmonth);

    let monthTotal: number = 0;

    //対象年月の日次データを取得する
    dailyData.forEach(datum => {
      monthTotal += datum.total;
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
  public getMonthlyData(email: string, yearmonth: string): Observable<Monthly | undefined> {
    const path: string = Fire.combinePath([this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.MONTHLY, yearmonth]);
    return this.angularFire.doc<Monthly | undefined>(path).valueChanges();
  }
  //#endregion

  //#region getSummaryData
  /**
   * サマリーデータを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param yearmonth 対象の年月
   * @returns 工数のサマリーデータ
   */
  public getSummaryData(email: string, yearmonth: string): Observable<Jobs[]> {
    return this.sJobs.getDataOneMonth(email, yearmonth)
      .pipe(
        map(data => {
          //サマリーデータ格納用変数
          let summaryData: Jobs[] = [];

          //取得したデータをもとにサマリーを作成
          data.forEach(job => {
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
          summaryData.sort((a, b) => {
            return a.job > b.job ? 1 : -1;
          });

          return summaryData;
        })
      );
  }
  //#endregion

  //#endregion
}
