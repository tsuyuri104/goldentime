import { Injectable } from '@angular/core';
import { addDoc, collection, collectionGroup, getDocs, getFirestore, query, Timestamp, where } from 'firebase/firestore';
import { ArticleCollectionName } from '../consts/article-collection-name';
import { ArticleFiledName } from '../consts/article-filed-name';
import { Reactioner } from '../interfaces/document/reactioner';
import { ReactionType } from '../types/reaction-type';

@Injectable({
  providedIn: 'root'
})
export class ReactionerService {

  //#region コンストラクタ
  constructor() {

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

    //登録するデータ
    const data: Reactioner = {
      user: email,
      reaction: type,
      create_timestamp: tsNow,
      article_id: articleId,
    }

    //登録する
    const ref = collection(db, ArticleCollectionName.ARTICLE, articleId, ArticleCollectionName.REACTIONER);
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
    const q = query(collectionGroup(db, ArticleCollectionName.REACTIONER), where(ArticleFiledName.ARTICLE_ID, "==", articleId), where(ArticleFiledName.USER, "==", email));
    const docs = await getDocs(q);

    docs.forEach(doc => {
      data.push(<Reactioner>doc.data());
    });

    return data;
  }
  //#endregion
}
