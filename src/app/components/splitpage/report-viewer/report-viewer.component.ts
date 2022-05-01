import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleData } from 'src/app/interfaces/component/article-data';
import { ArticleService } from 'src/app/services/article.service';

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnInit {

  //#region 変数

  public isLoaded: boolean = false;
  public articleData?: ArticleData;

  //#endregion

  //#region コンストラクタ
  constructor(private route: ActivatedRoute,
    private sArticle: ArticleService) {

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

  //#region getArticle
  /**
   * 記事データを取得する
   */
  private async getArticle(): Promise<void> {
    this.isLoaded = false;

    const id: string = this.getArticleId();
    this.articleData = await this.sArticle.getArticleData(id);

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
