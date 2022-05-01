import { Injectable } from '@angular/core';
import { addDoc, collection, DocumentReference, getDocs, getFirestore, query, Timestamp, where } from 'firebase/firestore';
import { ArticleList } from '../interfaces/component/article-list';
import { Article } from '../interfaces/document/article';
import { Edition } from '../interfaces/document/edition';
import { Urdayin } from '../interfaces/document/urdayin';
import { ArticleStatus } from '../types/article-status';
import { Common } from '../utilities/common';
import { UrdayinService } from './urdayin.service';

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
  constructor(private sUrdayin: UrdayinService) {

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
      summary_text: Common.cutLongText(Common.deleteHtmlTag(text), 100),
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

  //#region getArticleList
  /**
   *記事一覧を取得する
   * @param email 
   * @returns 
   */
  public async getArticleList(email: string): Promise<ArticleList[]> {
    let list: ArticleList[] = [];
    const db = getFirestore();

    //公開非公開問わず自分の記事を取得する
    const myQuery = query(collection(db, this.COLLECTION_NAME), where(this.FIELD_NAME.WRITER, "==", email));
    const myDocs = await getDocs(myQuery);

    //公開の他人の記事を取得する
    let theirStatus: ArticleStatus = "public";
    const theirQuery = query(collection(db, this.COLLECTION_NAME), where(this.FIELD_NAME.WRITER, "!=", email), where(this.FIELD_NAME.STATUS, "==", theirStatus))
    const theirDocs = await getDocs(theirQuery);

    //メンバーデータを取得する
    let member: Urdayin[] = await this.sUrdayin.getMemberData();

    //自分の記事を格納する
    myDocs.forEach(doc => {
      let data: Article = <Article>doc.data();
      list.push(this.setArticleListItem(doc.id, data, this.pickUpUserName(member, data.writer)));
    });

    //他人の記事を格納する
    theirDocs.forEach(doc => {
      let data: Article = <Article>doc.data();
      list.push(this.setArticleListItem(doc.id, data, this.pickUpUserName(member, data.writer)));
    });

    //更新日降順でソートする
    list = this.sortUpdateTimestampDesc(list);

    return list;
  }
  //#endregion

  //#region 
  /**
   * ユーザー名を取得する
   * @param memberData 
   * @param email 
   * @returns 
   */
  private pickUpUserName(memberData: Urdayin[], email: string): string {
    return <string>memberData.find(x => x.email === email)?.user_name;
  }
  //#endregion

  //#region setArticleListItem
  /**
   * リストのアイテムにデータを設定する
   * @param id 
   * @param data 
   * @param userName 
   * @returns 
   */
  private setArticleListItem(id: string, data: Article, userName: string): ArticleList {
    return <ArticleList>{
      id: id,
      title: data.summary_title,
      text: data.summary_text,
      writer: data.writer,
      update_timestamp: data.update_timestamp,
      user_name: userName,
    }
  }
  //#endregion

  //#region sortUpdateTimestampDesc
  /**
   * 更新日でソートする
   * @param arg 
   * @returns 
   */
  private sortUpdateTimestampDesc(arg: ArticleList[]): ArticleList[] {
    return arg.sort((a, b) => {
      if (a.update_timestamp < b.update_timestamp) {
        return 1;
      }

      if (a.update_timestamp > b.update_timestamp) {
        return -1;
      }
      return 0;
    });
  }
  //#endregion

  //#endregion
}
