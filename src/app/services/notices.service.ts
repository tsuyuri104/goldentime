import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Notice } from '../interfaces/document/notice';

@Injectable({
  providedIn: 'root'
})
export class NoticesService {

  //#region 変数

  private readonly COLLECTION_NAME: string = "notices";

  //#endregion

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly VERSION: string = "version";
  }

  //#endregion

  //#region コンストラクタ
  constructor(private angularFire: AngularFirestore) {
  }
  //#endregion

  //#region メソッド

  //#region 
  /**
   * 更新履歴データを取得する
   * バージョン降順、３件のみ取得する
   * @returns 更新履歴データ
   */
  public getNotices(): Observable<Notice[]> {
    return this.angularFire.collection<Notice>(this.COLLECTION_NAME, ref => ref.orderBy(this.FIELD_NAME.VERSION, "desc").limit(3)).valueChanges();
  }
  //#endregion

  //#endregion

}
