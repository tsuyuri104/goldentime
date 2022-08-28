import { Injectable } from '@angular/core';
import { addDoc, collection, collectionGroup, getDocs, getFirestore, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { ArticleCollectionName } from '../consts/article-collection-name';
import { ArticleFiledName } from '../consts/article-filed-name';
import { ExComment } from '../interfaces/component/ex-comment';
import { Comment } from '../interfaces/document/comment';
import { Urdayin } from '../interfaces/document/urdayin';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region addComment
  /**
   * コメントを追加する
   * @param articleId 
   * @param email 
   * @param text 
   * @returns 
   */
  public async addComment(articleId: string, email: string, text: string): Promise<ExComment[]> {
    const db = getFirestore();
    const tsNow: Timestamp = Timestamp.now();

    //登録するデータ
    const data: Comment = {
      commenter: email,
      comment: text,
      create_timestamp: tsNow,
      article_id: articleId,
    }

    //登録する
    const ref = collection(db, ArticleCollectionName.ARTICLE, articleId, ArticleCollectionName.COMMENTS);
    await addDoc(ref, data);

    console.log("end");

    // 再取得する
    return this.getComments(articleId, email);
  }
  //#endregion

  //#region getComments
  /**
   * 記事のコメントを取得する
   * @param articleId 
   * @param email 
   * @returns 
   */
  public async getComments(articleId: string, email: string): Promise<ExComment[]> {
    const db = getFirestore();

    //メンバーデータを取得する
    let member: Urdayin[] = await this.sUrdayin.getMemberData();

    //コメントデータを取得する
    const q = query(collectionGroup(db, ArticleCollectionName.COMMENTS), where(ArticleFiledName.ARTICLE_ID, "==", articleId), orderBy(ArticleFiledName.CREATE_TIMESTAMP, "asc"));
    const docs = await getDocs(q);
    let comments: ExComment[] = [];
    docs.forEach(doc => {
      let tmp: ExComment = <ExComment>doc.data();

      //名前を取得して設定する
      tmp.commenter_name = this.sUrdayin.pickUpUserName(member, tmp.commenter);

      //閲覧者のコメントか判定する
      tmp.is_mine = tmp.commenter === email;

      comments.push(tmp);
    });

    return comments;
  }
  //#endregion
}
