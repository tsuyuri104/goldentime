import { Injectable } from '@angular/core';
import { addDoc, collection, collectionGroup, getDocs, getFirestore, query, Timestamp, where } from 'firebase/firestore';
import { Reactioner } from '../interfaces/document/reactioner';
import { ReactionType } from '../types/reaction-type';
import { ArticleService } from './article.service';

@Injectable({
  providedIn: 'root'
})
export class ReactionerService {

  //#region 内部クラス

  private FIELD_NAME = class {
    public static readonly USER: string = "user";
    public static readonly REACTION: string = "reaction";
    public static readonly CREATE_TIMESTAMP: string = "create_timestamp";
    public static readonly ARTICLE_ID: string = "article_id";
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sArticle: ArticleService) {

  }
  //#endregion

  //#region addReaction
  /**
   * リアクションを追加する
   * @param articleId 
   * @param email 
   * @param type 
   */
  public addReaction(articleId: string, email: string, type: ReactionType): void {
    const db = getFirestore();
    const tsNow: Timestamp = Timestamp.now();
    const edition: number = 1;

    //登録するデータ
    const data: Reactioner = {
      user: email,
      reaction: type,
      create_timestamp: tsNow,
      article_id: articleId,
    }

    //登録する
    const ref = collection(db, this.sArticle.COLLECTION_NAME, articleId, this.sArticle.SUB_COLLECTION_NAME.REACTIONER);
    addDoc(ref, data);
  }
  //#endregion

  //#region getReactionerData
  /**
   * 記事、ユーザーごとにリアクションデータを取得する
   * @param articleId 
   * @param email 
   * @returns 
   */
  public async getReactionerData(articleId: string, email: string): Promise<Reactioner[]> {
    let data: Reactioner[] = [];
    const db = getFirestore();

    // 反応者を取得する
    const q = query(collectionGroup(db, this.sArticle.SUB_COLLECTION_NAME.REACTIONER), where(this.FIELD_NAME.ARTICLE_ID, "==", articleId), where(this.FIELD_NAME.USER, "==", email));
    const docs = await getDocs(q);

    docs.forEach(doc => {
      data.push(<Reactioner>doc.data());
    });

    return data;
  }
  //#endregion
}
