import { Injectable } from '@angular/core';
import { collectionGroup, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { ArticleCollectionName } from '../consts/article-collection-name';
import { ArticleFiledName } from '../consts/article-filed-name';
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

  //#region getEditionId
  /**
   * 記事IDとエディション番号を指定して、エディションIDを取得する
   * @param articleId 
   * @param edition 
   * @returns 
   */
  public async getEditionId(articleId: string, edition: number): Promise<string> {
    const db = getFirestore();
    const q = query(collectionGroup(db, ArticleCollectionName.EDITIONS), where(ArticleFiledName.ARTICLE_ID, "==", articleId), where(ArticleFiledName.EDITION, "==", edition));
    const docs = await getDocs(q);
    return docs.docs[0].id;
  }
  //#endregion
}
