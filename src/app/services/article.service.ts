import { Injectable } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  //#region 変数

  private readonly COLLECTION_NAME: string = "article";

  //#endregion

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly TITLE: string = "title";
    public static readonly WRITER: string = "writer";
    public static readonly CREATE_DATE: string = "create_date";
    public static readonly UPDATE_DATE: string = "update_date";
  }

  public SUB_COLLECTION_NAME = class {
    public static readonly COMMENTS: string = "comments";
    public static readonly EDITIONS: string = "editions";
  }

  //#endregion

  //#region コンストラクタ
  constructor() {

  }
  //#endregion
}
