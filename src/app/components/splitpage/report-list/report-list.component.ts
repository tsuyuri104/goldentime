import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteName } from 'src/app/consts/route-name';
import { ArticleData } from 'src/app/interfaces/component/article-data';
import { ArticleList } from 'src/app/interfaces/component/article-list';
import { Reactioner } from 'src/app/interfaces/document/reactioner';
import { ArticleService } from 'src/app/services/article.service';
import { FileService } from 'src/app/services/file.service';
import { ReactionerService } from 'src/app/services/reactioner.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { ArticleStatus } from 'src/app/types/article-status';
import { DateUtil } from 'src/app/utilities/date-util';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {

  //#region 変数

  public articleList: ArticleList[] = [];

  //#endregion

  //#region コンストラクタ
  constructor(private sArticle: ArticleService
    , private sUrdayin: UrdayinService
    , private router: Router
    , private sFile: FileService
    , private sReactioner: ReactionerService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  public ngOnInit(): void {
    this.getArticleList();
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region transitionViewer
  /**
   * 閲覧画面に遷移する
   * @param id 
   */
  public transitionViewer(id: string): void {
    this.router.navigateByUrl("/" + RouteName.VIEWER + "/" + id);
  }
  //#endregion

  //#region exportArticle
  /**
   * 記事ファイルを出力する
   * @param id 
   * @param title 
   */
  public async exportArticle(id: string, title: string): Promise<void> {
    const dom: Document = await this.createFile(id);
    const stringDom: string = String(dom.documentElement.outerHTML);
    this.sFile.download(stringDom, title, "text/html");
  }
  //#endregion

  //#region isPrivate
  /**
   * 非公開の記事か判定する
   * @param status 
   * @returns 
   */
  public isPrivate(status: ArticleStatus): boolean {
    return status === "private";
  }

  //#region isPublic
  /**
   * 公開の記事か判定する
   * @param status 
   * @returns 
   */
  public isPublic(status: ArticleStatus): boolean {
    return status === "public";
  }
  //#endregion

  //#region getArticleList
  /**
   * 記事リストを取得する
   */
  private getArticleList(): void {
    this.sArticle.getArticleList(this.sUrdayin.getSelectedUser())
      .then((data) => {
        this.articleList = data;
      });
  }
  //#endregion

  //#region createFile
  /**
   * 記事ファイルを作成する
   * @param id 
   * @returns 
   */
  private async createFile(id: string): Promise<Document> {

    const email: string = this.sUrdayin.getSelectedUser();

    //記事データを取得する
    const articleData: ArticleData = await this.sArticle.getArticleData(id, email);

    //閲覧者の反応データを取得する
    const reactioners: Reactioner[] = await this.sReactioner.getReactionerData(id, email);

    //自分の記事か判定する
    articleData.isMine = articleData.article.writer === email;

    // テンプレートファイルを取得する
    const text = await (await fetch("assets/article.html")).text();
    let dom = new DOMParser().parseFromString(text, "text/html");

    // データをテンプレートに埋め込む
    dom.head.getElementsByTagName("title")[0].innerHTML = articleData.text.title;

    dom.getElementById("articleTitle")!.innerHTML = articleData.text.title;
    dom.getElementById("articleWriter")!.innerHTML = articleData.article.writer_name;
    dom.getElementById("articleCreateDateTime")!.innerHTML = DateUtil.toStringDateTime(articleData.text.create_timestamp.toDate());
    dom.getElementById("articleText")!.innerHTML = articleData.text.text;

    dom.getElementById("reactionHeart")!.innerHTML = String(articleData.article.reactions.heart);
    dom.getElementById("reactionClap")!.innerHTML = String(articleData.article.reactions.clap);
    dom.getElementById("reactionThumbsup")!.innerHTML = String(articleData.article.reactions.thumbsup);

    const template: HTMLElement = <HTMLElement>dom.getElementsByClassName("comment-template")[0];
    let wrapper: HTMLElement = dom.getElementById("commentWrapper")!;
    articleData.comments.forEach(comment => {
      let divComment: HTMLElement = this.copyTemplateElement(template);

      divComment.classList.remove("comment-template");

      divComment.getElementsByClassName("comment-commenter")[0].innerHTML = comment.commenter_name;
      divComment.getElementsByClassName("comment-card-body")[0].innerHTML = comment.comment;
      divComment.getElementsByClassName("comment-date")[0].innerHTML = DateUtil.toStringDateTime(comment.create_timestamp.toDate());

      wrapper.appendChild(divComment);
    });

    return dom;
  }
  //#endregion

  //#region copyTemplateElement
  /**
   * テンプレートエレメントを複製する
   * @param elm 
   * @returns 
   */
  private copyTemplateElement(elm: HTMLElement): HTMLElement {
    let ret: HTMLElement = document.createElement(elm.tagName);

    elm.classList.forEach(item => {
      ret.classList.add(item);
    });

    for (let i = 0; i < elm.children.length; i++) {
      ret.appendChild(this.copyTemplateElement(<HTMLElement>elm.children[i]));
    }

    return ret;
  }
  //#endregion

  //#endregion

}
