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
import { EditionsService } from './editions.service';
import { UrdayinService } from './urdayin.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService, private sEditions: EditionsService) {

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
    const myQuery = query(collection(db, ArticleCollectionName.ARTICLE), where(ArticleFiledName.WRITER, "==", email));
    const myDocs = await getDocs(myQuery);

    //公開の他人の記事を取得する
    let theirStatus: ArticleStatus = "public";
    const theirQuery = query(collection(db, ArticleCollectionName.ARTICLE), where(ArticleFiledName.WRITER, "!=", email), where(ArticleFiledName.STATUS, "==", theirStatus))
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

  //#region getArticleData
  /**
   * 記事データを記事IDから取得する
   * @param id 
   * @returns 
   */
  public async getArticleData(id: string): Promise<ArticleData> {
    let data: ArticleData = this.getEmptyArticleData();
    const db = getFirestore();

    //メンバーデータを取得する
    let member: Urdayin[] = await this.sUrdayin.getMemberData();

    // Articleを取得する
    const refArticle = doc(db, ArticleCollectionName.ARTICLE, id);
    const snapArticle = await getDoc(refArticle);
    let article: ExArticle = <ExArticle>snapArticle.data();
    //名前を取得して設定する
    article.writer_name = this.pickUpUserName(member, article.writer);

    // Editionsを取得する
    const qEdition = query(collectionGroup(db, ArticleCollectionName.EDITIONS), where(ArticleFiledName.ARTICLE_ID, "==", id), where(ArticleFiledName.EDITION, "==", article.last_edition));
    const docsEsition = await getDocs(qEdition);
    let edition: ExEdition = <ExEdition>docsEsition.docs[0].data();

    // Commentsを取得する
    const qComments = query(collectionGroup(db, this.SUB_COLLECTION_NAME.COMMENTS), where(this.sEditions.FIELD_NAME.ARTICLE_ID, "==", id));
    const docsComments = await getDocs(qComments);
    let comments: ExComment[] = [];
    docsComments.forEach(doc => {
      let tmp: ExComment = <ExComment>doc.data();

      //名前を取得して設定する
      tmp.commenter_name = this.pickUpUserName(member, tmp.commenter);

      comments.push(tmp);
    });

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
