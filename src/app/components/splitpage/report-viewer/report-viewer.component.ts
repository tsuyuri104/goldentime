import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleData } from 'src/app/interfaces/component/article-data';
import { Reactioner } from 'src/app/interfaces/document/reactioner';
import { ArticleService } from 'src/app/services/article.service';
import { ReactionerService } from 'src/app/services/reactioner.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { ReactionType } from 'src/app/types/reaction-type';

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnInit {

  //#region 変数

  public isLoaded: boolean = false;
  public articleData: ArticleData = this.sArticle.getEmptyArticleData();
  //#endregion

  //#region コンストラクタ
  constructor(private route: ActivatedRoute,
    private sArticle: ArticleService,
    private sReactioner: ReactionerService,
    private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  public async ngOnInit(): Promise<void> {
    await this.getArticle();
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region reaction
  /**
   * 記事に対してリアクションする
   * @param type 
   * @returns 
   */
  public reaction(type: ReactionType): void {

    // すでに反応している場合は処理しない
    if (this.isReactioned(type)) {
      return;
    }

    const articleId: string = this.getArticleId();

    // データ登録
    this.sReactioner.addReaction(articleId, this.sUrdayin.getSelectedUser(), type);

    // データ更新
    this.sArticle.updateReaction(articleId, type).then(data => {
      // データ再取得
      this.articleData.article.reactions = data;
    });

    // フラグ書き替え
    switch (type) {
      case "heart":
        this.articleData.isReactionedHeart = true;
        break;
      case "clap":
        this.articleData.isReactionedClap = true;
        break;
      case "thumbsup":
        this.articleData.isReactionedThumbsup = true;
        break;
    }
  }
  //#endregion

  //#region isReactioned
  /**
   * リアクションしたか判定する
   * @param type 
   * @returns 
   */
  private isReactioned(type: ReactionType): boolean {
    switch (type) {
      case "heart":
        return this.articleData.isReactionedHeart;
      case "clap":
        return this.articleData.isReactionedClap;
      case "thumbsup":
        return this.articleData.isReactionedThumbsup;
      default:
        return false;
    }
  }
  //#endregion

  //#region getArticle
  /**
   * 記事データを取得する
   */
  private async getArticle(): Promise<void> {
    this.isLoaded = false;

    const id: string = this.getArticleId();
    this.articleData = await this.sArticle.getArticleData(id);

    //閲覧者の反応データを取得する
    const reactioners: Reactioner[] = await this.sReactioner.getReactionerData(id, this.sUrdayin.getSelectedUser());
    reactioners.forEach(reactioner => {
      switch (reactioner.reaction) {
        case "heart":
          this.articleData.isReactionedHeart = true;
          break;
        case "clap":
          this.articleData.isReactionedClap = true;
          break;
        case "thumbsup":
          this.articleData.isReactionedThumbsup = true;
          break;
      }
    });

    this.isLoaded = true;
  }
  //#endregion

  //#region getArticleId
  /**
   * URLから記事IDを取得する
   * @returns 
   */
  private getArticleId(): string {
    return <string>this.route.snapshot.paramMap.get('id');
  }
  //#endregion

  //#endregion

}
