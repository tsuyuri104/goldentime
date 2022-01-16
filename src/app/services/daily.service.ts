import { Injectable } from '@angular/core';
import { getDoc, getFirestore, deleteDoc, doc, setDoc, DocumentData, query, collection, where, documentId, getDocs, QuerySnapshot, addDoc } from 'firebase/firestore';
import { Daily } from '../interfaces/daily';
import { Dailys } from '../interfaces/dailys';
import { Jobs } from '../interfaces/jobs';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class DailyService {

  //#region 変数

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
    docs.forEach(async doc => {
      await deleteDoc(doc.ref);
    });

    //日次データ整形
    const daily: Daily = {
      memo: inputData.memo,
      total: inputData.total,
    }

    //対象日の日次データを更新する
    const docRef = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date);
    await setDoc(docRef, daily);

    //仕事データ整形
    const jobs: Jobs[] = <Jobs[]>inputData.jobs;

    jobs.forEach(job => {
      //仕事データ整形
      job.user = email;
      job.date = date;

      //仕事データを更新する
      const ref2 = collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date, this.SUB_COLLECTION_NAME.JOBS);
      addDoc(ref2, job);
    });
  }
  //#endregion

  //#region getDailysData
  /**
   * １ヶ月の日次データを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param yearmonth 対象の年月
   * @returns 対象の１ヶ月分の日次データ
   */
  public async getDailysData(email: string, yearmonth: string): Promise<Dailys> {
    const newDailysSnap = await this.getDataOneMonth(email, yearmonth);
    let newDailys: Dailys = {};
    newDailysSnap.forEach(snap => {
      newDailys[snap.id] = <Daily>snap.data();
    });
    return newDailys;
  }
  //#endregion

  //#endregion
}
