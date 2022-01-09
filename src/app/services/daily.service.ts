import { Injectable } from '@angular/core';
import { getDoc, getFirestore, deleteDoc, doc, setDoc, DocumentData, query, collection, where, documentId, getDocs, QuerySnapshot } from 'firebase/firestore';
import { Daily } from '../interfaces/daily';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class DailyService {

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

  //#region getDailyData
  /**
   * 日次データを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param date 対象の年月日
   * @returns 対象の日次データ
   */
  public async getData(email: string, date: string): Promise<DocumentData | undefined> {
    const db = getFirestore();
    const ref = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.FIELD_NAME.DAILY, date);
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
    const docs: Daily[] = [];
    const db = getFirestore();
    const q = query(collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.FIELD_NAME.DAILY), where(documentId(), ">=", yearmonth + "01"), where(documentId(), "<=", yearmonth + "31"));
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
    const docRef = doc(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.FIELD_NAME.DAILY, date);

    // 削除
    await deleteDoc(docRef);

    // 追加
    await setDoc(docRef, inputData);
  }
  //#endregion

  //#endregion
}
