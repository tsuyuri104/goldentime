import { Injectable } from '@angular/core';
import { addDoc, collection, DocumentReference, getFirestore, Timestamp } from 'firebase/firestore';
import { Article } from '../interfaces/document/article';
import { Edition } from '../interfaces/document/edition';
import { ArticleStatus } from '../types/article-status';
import { Common } from '../utilities/common';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  //#region 変数

  private readonly COLLECTION_NAME: string = "article";

  //#endregion

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly WRITER: string = "writer";
    public static readonly STATUS: string = "status";
    public static readonly SUMMARY_TITLE: string = "summary_title";
    public static readonly SUMMARY_TEXT: string = "summary_text";
    public static readonly CREATE_TIMESTAMP: string = "create_timestamp";
    public static readonly UPDATE_TIMESTAMP: string = "update_timestamp";
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

  //#region メソッド

  //#region addArticle
  /**
   * 記事を登録する
   * @param email 
   * @param title 
   * @param text 
   */
  public async addArticle(email: string, title: string, text: string): Promise<void> {
    const db = getFirestore();
    const tsNow: Timestamp = Timestamp.now();
    const edition: number = 1;
    const status: ArticleStatus = "public";

    //Articleに登録するデータ
    const articleDatum: Article = {
      writer: email,
      create_timestamp: tsNow,
      update_timestamp: tsNow,
      status: status,
      last_edition: edition,
      reactions: [],
      summary_title: Common.cutLongText(title, 10),
      summary_text: Common.cutLongText(Common.deleteHtmlTag(text), 30),
    }

    //Articleに登録する
    const articleRef = collection(db, this.COLLECTION_NAME);
    const articleDocRef: DocumentReference = await addDoc(articleRef, articleDatum);

    //Editionsに登録するデータ
    const editionDatum: Edition = {
      edition: edition,
      title: title,
      text: text,
      create: tsNow,
    }

    //Editionsに登録する
    const editionRef = collection(db, this.COLLECTION_NAME, articleDocRef.id, this.SUB_COLLECTION_NAME.EDITIONS);
    addDoc(editionRef, editionDatum);
  }
  //#endregion

  //#endregion
}
