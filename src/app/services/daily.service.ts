import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getDoc, getFirestore, deleteDoc, doc, setDoc, DocumentData, query, collection, where, getDocs, QuerySnapshot, addDoc, documentId, snapshotEqual } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Daily } from '../interfaces/document/daily';
import { DailyKeyValue } from '../interfaces/document/daily-key-value';
import { UrdayinService } from './urdayin.service';
import { Fire } from '../utilities/fire';
import { Jobs } from '../interfaces/document/jobs';

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
  constructor(private sUrdayin: UrdayinService, private angularFire: AngularFirestore) {

  }
  //#endregion

  //#region メソッド

  //#region getData
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
  public getDataOneMonth(email: string, yearmonth: string): Observable<Daily[]> {
    const path: string = Fire.combinePath([this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY]);
    return this.angularFire.collection<Daily>(path,
      ref => ref.where(documentId(), ">=", yearmonth + "01")
        .where(documentId(), "<=", yearmonth + "31")
    ).valueChanges({ idField: 'date' });
  }
  //#endregion

  //#region deleteInsertDocs
  /**
   * 日次データを削除して追加する
   * @param inputData 追加するデータ
   * @param email 処理対象のユーザーのメールアドレス
   * @param date 処理対象の年月日
   */
  public async deleteInsertDocs(inputData: Daily, email: string, date: string): Promise<void> {
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
  }
  //#endregion

  //#region convertDailyKeyValue
  /**
   * Daily型からDailyKeyValue型へ変換する
   * @param docs 
   * @returns 
   */
  public convertDailyKeyValue(dailys: Daily[]): DailyKeyValue {
    let newDailys: DailyKeyValue = {};
    dailys.forEach(day => {
      const date: string = <string>day.date;
      if (date !== "") {
        newDailys[date] = day;
      }
    });
    return newDailys;
  }
  //#endregion

  //#endregion
}
