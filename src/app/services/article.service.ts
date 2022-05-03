import { Injectable } from '@angular/core';
import { addDoc, collection, collectionGroup, doc, DocumentReference, getDoc, getDocs, getFirestore, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { ArticleCollectionName } from '../classes/article-collection-name';
import { ArticleFiledName } from '../classes/article-filed-name';
import { ArticleData } from '../interfaces/component/article-data';
import { ArticleList } from '../interfaces/component/article-list';
import { ExArticle } from '../interfaces/component/ex-article';
import { ExComment } from '../interfaces/component/ex-comment';
import { ExEdition } from '../interfaces/component/ex-edition';
import { Article } from '../interfaces/document/article';
import { Edition } from '../interfaces/document/edition';
import { Reaction } from '../interfaces/document/reaction';
import { Urdayin } from '../interfaces/document/urdayin';
import { ArticleStatus } from '../types/article-status';
import { ReactionType } from '../types/reaction-type';
import { Common } from '../utilities/common';
import { CommentsService } from './comments.service';
import { EditionsService } from './editions.service';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService, private sComments: CommentsService, private sEdition: EditionsService) {

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
      reactions: this.getEmptyReactions(),
      summary_title: Common.cutLongText(title, 10),
      summary_text: Common.cutLongText(Common.deleteHtmlTag(text), 100),
      comment_volume: 0,
    }

    //Articleに登録する
    const articleRef = collection(db, ArticleCollectionName.ARTICLE);
    const articleDocRef: DocumentReference = await addDoc(articleRef, articleDatum);

    //Editionsに登録するデータ
    const editionDatum: Edition = {
      edition: edition,
      title: title,
      text: text,
      create_timestamp: tsNow,
      article_id: articleDocRef.id,
    }

    //Editionsに登録する
    const editionRef = collection(db, ArticleCollectionName.ARTICLE, articleDocRef.id, ArticleCollectionName.EDITIONS);
    addDoc(editionRef, editionDatum);
  }
  //#endregion

  //#region updateArticle
  /**
   * 記事を更新する
   * @param id 
   * @param title 
   * @param text 
   */
  public async updateArticle(id: string, title: string, text: string): Promise<void> {
    const db = getFirestore();
    const tsNow: Timestamp = Timestamp.now();

    //対象のデータを取得する
    const refArticle = doc(db, ArticleCollectionName.ARTICLE, id);
    const snapArticle = await getDoc(refArticle);
    let article: Article = <Article>snapArticle.data();

    // 更新する値を設定する
    const newEdition: number = article.last_edition + 1;
    article.last_edition = newEdition;
    article.update_timestamp = tsNow;
    article.summary_title = Common.cutLongText(title, 10);
    article.summary_text = Common.cutLongText(Common.deleteHtmlTag(text), 100);

    //登録する
    setDoc(refArticle, article);

    //Editionsに登録するデータ
    const edition: Edition = {
      edition: newEdition,
      title: title,
      text: text,
      create_timestamp: tsNow,
      article_id: id,
    }

    //Editionsに登録する
    const editionRef = collection(db, ArticleCollectionName.ARTICLE, id, ArticleCollectionName.EDITIONS);
    addDoc(editionRef, edition);
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

    //公開非公開問わず自分の記事を取得する(削除は除く)
    const deleted: ArticleStatus = "delete";
    const myQuery = query(collection(db, ArticleCollectionName.ARTICLE), where(ArticleFiledName.WRITER, "==", email), where(ArticleFiledName.STATUS, "!=", deleted));
    const myDocs = await getDocs(myQuery);

    //公開の他人の記事を取得する
    const theirStatus: ArticleStatus = "public";
    const theirQuery = query(collection(db, ArticleCollectionName.ARTICLE), where(ArticleFiledName.WRITER, "!=", email), where(ArticleFiledName.STATUS, "==", theirStatus))
    const theirDocs = await getDocs(theirQuery);

    //メンバーデータを取得する
    let member: Urdayin[] = await this.sUrdayin.getMemberData();

    //自分の記事を格納する
    myDocs.forEach(doc => {
      let data: Article = <Article>doc.data();
      list.push(this.setArticleListItem(doc.id, data, this.sUrdayin.pickUpUserName(member, data.writer)));
    });

    //他人の記事を格納する
    theirDocs.forEach(doc => {
      let data: Article = <Article>doc.data();
      list.push(this.setArticleListItem(doc.id, data, this.sUrdayin.pickUpUserName(member, data.writer)));
    });

    //更新日降順でソートする
    list = this.sortUpdateTimestampDesc(list);

    return list;
  }
  //#endregion

  //#region getArticleData
  /**
   * 記事データを記事IDから取得する
   * @param id 
   * @param email
   * @returns 
   */
  public async getArticleData(id: string, email: string): Promise<ArticleData> {
    let data: ArticleData = this.getEmptyArticleData();
    const db = getFirestore();

    //メンバーデータを取得する
    let member: Urdayin[] = await this.sUrdayin.getMemberData();

    // Articleを取得する
    const refArticle = doc(db, ArticleCollectionName.ARTICLE, id);
    const snapArticle = await getDoc(refArticle);
    let article: ExArticle = <ExArticle>snapArticle.data();
    //名前を取得して設定する
    article.writer_name = this.sUrdayin.pickUpUserName(member, article.writer);

    // Editionsを取得する
    let edition: ExEdition = await this.sEdition.getEdition(id, article.last_edition);

    // Commentsを取得する
    let comments: ExComment[] = await this.sComments.getComments(id, email);

    data.article = article;
    data.text = edition;
    data.comments = comments;

    return data;
  }
  //#endregion

  //#region getEmptyArticleData
  /**
   * 空の記事データを取得する
   * @returns 
   */
  public getEmptyArticleData(): ArticleData {
    const now: Timestamp = Timestamp.now();
    const status: ArticleStatus = "private";
    return {
      article: {
        writer: '',
        create_timestamp: now,
        update_timestamp: now,
        status: status,
        summary_text: '',
        summary_title: '',
        last_edition: 0,
        reactions: {
          heart: 0,
          clap: 0,
          thumbsup: 0,
        },
        writer_name: '',
        comment_volume: 0,
      },
      text: {
        edition: 0,
        title: '',
        text: '',
        create_timestamp: now,
        article_id: '',
      },
      comments: [],
      isReactionedHeart: false,
      isReactionedClap: false,
      isReactionedThumbsup: false,
      isMine: false,
    }
  }
  //#endregion

  //#region updateReaction
  /**
   * リアクション数を更新する
   * @param articleId 
   * @param type 
   * @returns 
   */
  public async updateReaction(articleId: string, type: ReactionType): Promise<Reaction> {
    const db = getFirestore();

    //対象のデータを取得する
    const refArticle = doc(db, ArticleCollectionName.ARTICLE, articleId);
    const snapArticle = await getDoc(refArticle);
    let article: Article = <Article>snapArticle.data();

    //値を加算する
    switch (type) {
      case "heart":
        article.reactions.heart += 1;
        break;
      case "clap":
        article.reactions.clap += 1;
        break;
      case "thumbsup":
        article.reactions.thumbsup += 1;
        break;
    }

    //登録する
    const docRef = doc(db, ArticleCollectionName.ARTICLE, articleId);
    await setDoc(docRef, article);

    //再取得したデータを返す
    return this.getReactionVolume(articleId);
  }
  //#endregion

  //#region updateComments
  /**
   * コメント数を更新する
   * @param articleId 
   * @returns 
   */
  public async updateComments(articleId: string): Promise<number> {
    const db = getFirestore();

    //対象のデータを取得する
    const refArticle = doc(db, ArticleCollectionName.ARTICLE, articleId);
    const snapArticle = await getDoc(refArticle);
    let article: Article = <Article>snapArticle.data();

    //値を加算する
    let volume: number = article.comment_volume + 1;
    article.comment_volume = volume;

    //登録する
    const docRef = doc(db, ArticleCollectionName.ARTICLE, articleId);
    await setDoc(docRef, article);

    //追加後の値
    return volume;
  }
  //#endregion

  //#region deleteArticle
  /**
   * 記事を削除する（論理削除）
   * @param id 
   */
  public async deleteArticle(id: string): Promise<void> {
    const db = getFirestore();

    //対象のデータを取得する
    const refArticle = doc(db, ArticleCollectionName.ARTICLE, id);
    const snapArticle = await getDoc(refArticle);
    let article: Article = <Article>snapArticle.data();
    article.status = "delete";

    //登録する
    await setDoc(refArticle, article);
  }
  //#endregion

  //#region getReactionVolume
  /**
   * リアクション数を取得する
   * @param articleId 
   * @returns 
   */
  private async getReactionVolume(articleId: string): Promise<Reaction> {
    const db = getFirestore();

    // Articleを取得する
    const refArticle = doc(db, ArticleCollectionName.ARTICLE, articleId);
    const snapArticle = await getDoc(refArticle);
    let article: Article = <Article>snapArticle.data();

    return article.reactions;
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
      reactions: data.reactions,
      comments: data.comment_volume,
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

  //#region getEmptyReactions
  /**
   * 空のリアクションを取得する（初期値用）
   * @returns 
   */
  private getEmptyReactions(): Reaction {
    return {
      heart: 0,
      thumbsup: 0,
      clap: 0,
    }
  }
  //#endregion

  //#endregion
}
