import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteName } from 'src/app/classes/route-name';
import { ArticleList } from 'src/app/interfaces/component/article-list';
import { ArticleService } from 'src/app/services/article.service';
import { UrdayinService } from 'src/app/services/urdayin.service';

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

  /**
   * 閲覧画面に遷移する
   * @param id 
   */
  public transitionViewr(id: string): void {
    this.router.navigateByUrl("/" + RouteName.VIEWER + "/" + id);
  }

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
