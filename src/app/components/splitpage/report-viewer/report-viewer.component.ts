import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModules } from "ngx-quill";
import { RouteName } from 'src/app/consts/route-name';
import { ArticleData } from 'src/app/interfaces/component/article-data';
import { InputOfFrmComment } from 'src/app/interfaces/component/input-of-frm-comment';
import { Reactioner } from 'src/app/interfaces/document/reactioner';
import { QuillConfiguration } from 'src/app/modules/quill-configuration/quill-configuration.module';
import { ArticleService } from 'src/app/services/article.service';
import { CommentsService } from 'src/app/services/comments.service';
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
  public quillConfiguration: QuillModules = QuillConfiguration;
  public frmComment: FormGroup = this.fb.group({
    comment: '',
  });

  //#endregion

  //#region コンストラクタ
  constructor(
    private route: ActivatedRoute
    , private sArticle: ArticleService
    , private sReactioner: ReactionerService
    , private sUrdayin: UrdayinService
    , private fb: FormBuilder
    , private sComments: CommentsService
    , private router: Router) {

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

  //#region writeComment
  /**
   * コメントする
   * @returns 
   */
  public writeComment(): void {

    const inputData: InputOfFrmComment = this.frmComment.value;

    //空文字の場合は登録しない
    if (inputData.comment === "") {
      return;
    }

    const articleId: string = this.getArticleId();

    // データ登録
    this.sComments.addComment(articleId, this.sUrdayin.getSelectedUser(), inputData.comment).then(data => {
      this.articleData.comments = data;
      this.frmComment = this.fb.group({
        comment: '',
      });
    });

    // データ更新
    this.sArticle.updateComments(articleId).then(data => {
      // データ再取得
      this.articleData.article.comment_volume = data;
    });
  }
  //#endregion

  //#region  delete
  /**
   * 記事を削除する
   */
  public delete(): void {
    const id: string = this.getArticleId();
    this.sArticle.deleteArticle(id).then(() => {
      this.router.navigateByUrl("/" + RouteName.REPORT);
    });
  }
  //#endregion

  //#region transitionEditor
  /**
   * 編集画面に遷移する
   */
  public transitionEditor(): void {
    const id: string = this.getArticleId();
    this.router.navigateByUrl("/" + RouteName.EDITOR + "/" + id);
  }
  //#endregion

  //#region transitionDiffer
  /**
   * 差分表示画面に遷移する
   * @returns 
   */
  public transitionDiffer(): void {

    // 初稿の場合は遷移しない
    if (this.articleData.article.last_edition === 1) {
      return;
    }

    const id: string = this.getArticleId();
    this.router.navigateByUrl("/" + RouteName.DIFFER + "/" + id);
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
    const email: string = this.sUrdayin.getSelectedUser();

    this.articleData = await this.sArticle.getArticleData(id, email);

    //閲覧者の反応データを取得する
    const reactioners: Reactioner[] = await this.sReactioner.getReactionerData(id, email);
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

    //自分の記事か判定する
    this.articleData.isMine = this.articleData.article.writer === email;

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
