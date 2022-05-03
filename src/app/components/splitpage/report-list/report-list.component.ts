import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteName } from 'src/app/classes/route-name';
import { ArticleList } from 'src/app/interfaces/component/article-list';
import { ArticleService } from 'src/app/services/article.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { ArticleStatus } from 'src/app/types/article-status';

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
  constructor(private sArticle: ArticleService, private sUrdayin: UrdayinService, private router: Router) {

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

  //#endregion

}
