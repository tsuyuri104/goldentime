import { Injectable } from '@angular/core';
import { getDoc, getFirestore, deleteDoc, doc, setDoc, DocumentData, query, collection, where, documentId, getDocs, QuerySnapshot, addDoc } from 'firebase/firestore';
import { Daily } from '../interfaces/document/daily';
import { Dailys } from '../interfaces/component/dailys';
import { Jobs } from '../interfaces/document/jobs';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class DailyService {

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly DATE: string = "date";
  }

  public SUB_COLLECTION_NAME = class {
    public static readonly JOBS: string = 'jobs';
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region メソッド

  //#region getDailyData
  /**
   * 日次データを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param date 対象の年月日
   * @returns 対象の日次データ
   */
  public async getData(email: string, date: string): Promise<DocumentData | undefined> {
    const db = getFirestore();
    const ref = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date);
    const snap = await getDoc(ref);
    return snap.data();
  }
  //#endregion

  //#region getDataOneMonth
  /**
   * １ヶ月分の日次データを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param yearmonth 対象の年月
   * @returns 対象の日次データ
   */
  public async getDataOneMonth(email: string, yearmonth: string): Promise<QuerySnapshot<DocumentData>> {
    const db = getFirestore();
    const q = query(collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY), where(documentId(), ">=", yearmonth + "01"), where(documentId(), "<=", yearmonth + "31"));
    return await getDocs(q);
  }
  //#endregion

  //#region deleteInsertDocs
  /**
   * 日次データを削除して追加する
   * @param inputData 追加するデータ
   * @param email 処理対象のユーザーのメールアドレス
   * @param date 処理対象の年月日
   */
  public async deleteInsertDocs(inputData: Daily, email: string, date: string) {
    const db = getFirestore();

    //対象日の仕事データを削除する
    const q = query(collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date, this.SUB_COLLECTION_NAME.JOBS));
    let docs = await getDocs(q);
    docs.forEach(doc => {
      deleteDoc(doc.ref);
    });

    //日次データ整形
    const daily: Daily = {
      memo: inputData.memo,
      total: inputData.total,
    }

    //対象日の日次データを更新する
    const docRef = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date);
    setDoc(docRef, daily);

    //仕事データ整形
    const jobs: Jobs[] = <Jobs[]>inputData.jobs;

    let index: number = 0;
    jobs.forEach(job => {

      //空の仕事データは処理スキップ
      if (this.isEmptyJobData(job)) {
        return;
      }

      //仕事データ整形
      job.user = email;
      job.date = date;
      job.index = index;
      index++;

      //仕事データを更新する
      const ref2 = collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date, this.SUB_COLLECTION_NAME.JOBS);
      addDoc(ref2, job);
    });
  }
  //#endregion

  //#region convertDailysInterface
  /**
   * スナップショットからDailys型へ変換する
   * @param docs 
   * @returns 
   */
  public convertDailysInterface(docs: QuerySnapshot<DocumentData>): Dailys {
    let newDailys: Dailys = {};
    docs.forEach(snap => {
      newDailys[snap.id] = <Daily>snap.data();
    });
    return newDailys;
  }
  //#endregion

  //#region isEmptyJobData
  /**
   * 空の仕事データか判定する
   * @param job 
   * @returns 
   */
  private isEmptyJobData(job: Jobs): boolean {
    //稼働０と仕事内容空白は空データと判定する
    if (job.hours === 0 && job.job === "") {
      return true;
    }
    return false;
  }
  //#endregion

  //#endregion
}
