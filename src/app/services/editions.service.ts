import { Injectable } from '@angular/core';
import { collectionGroup, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { ArticleCollectionName } from '../classes/article-collection-name';
import { ArticleFiledName } from '../classes/article-filed-name';
import { ExEdition } from '../interfaces/component/ex-edition';

@Injectable({
  providedIn: 'root'
})
export class EditionsService {

  //#region コンストラクタ
  constructor() {

  }
  //#endregion

  //#region getEdition
  /**
   * 記事IDとエディション番号を指定して、エディションデータを取得する
   * @param articleId 
   * @param edition 
   * @returns 
   */
  public async getEdition(articleId: string, edition: number): Promise<ExEdition> {
    const db = getFirestore();
    const q = query(collectionGroup(db, ArticleCollectionName.EDITIONS), where(ArticleFiledName.ARTICLE_ID, "==", articleId), where(ArticleFiledName.EDITION, "==", edition));
    const docs = await getDocs(q);
    return <ExEdition>docs.docs[0].data();
  }
  //#endregion
}
