import { Injectable } from '@angular/core';
import { collection, DocumentData, documentId, getDocs, getFirestore, limit, orderBy, query, QuerySnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoticesService {

  //#region 変数

  private readonly COLLECTION_NAME: string = "notices";

  public FIELD_NAME = class {
    public static readonly VERSION: string = "version";
  }

  //#endregion

  //#region コンストラクタ
  constructor() {

  }
  //#endregion

  //#region メソッド

  //#region 
  /**
   * 更新履歴データを取得する
   * @returns 更新履歴データ
   */
  public async getNotices(): Promise<QuerySnapshot<DocumentData>> {
    const db = getFirestore();
    const q = query(collection(db, this.COLLECTION_NAME), orderBy(this.FIELD_NAME.VERSION, "desc"), limit(3));
    return await getDocs(q);
  }
  //#endregion

  //#endregion

}
