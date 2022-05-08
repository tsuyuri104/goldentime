import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { ArticleData } from 'src/app/interfaces/component/article-data';
import { ExEdition } from 'src/app/interfaces/component/ex-edition';
import { ArticleService } from 'src/app/services/article.service';
import { EditionsService } from 'src/app/services/editions.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { Common } from 'src/app/utilities/common';

@Component({
  selector: 'app-report-differ',
  templateUrl: './report-differ.component.html',
  styleUrls: ['./report-differ.component.scss']
})
export class ReportDifferComponent implements OnInit {

  //#region 変数

  public after: ExEdition = this.getEmptyExEdition();
  public before: ExEdition = this.getEmptyExEdition();

  //#endregion

  //#region コンストラクタ
  constructor(private route: ActivatedRoute,
    private sEditions: EditionsService,
    private sArticle: ArticleService,
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

  //#region getArticle
  /**
   * 記事データを取得する
   */
  private async getArticle(): Promise<void> {

    const id: string = this.getArticleId();

    const article: ArticleData = await this.sArticle.getArticleData(id, this.sUrdayin.getSelectedUser());

    let after: ExEdition = await this.sEditions.getEdition(id, article.article.last_edition);
    let before: ExEdition = await this.sEditions.getEdition(id, (article.article.last_edition - 1));

    after.text = this.convertKaigyo(after.text);
    before.text = this.convertKaigyo(before.text);

    this.after = after;
    this.before = before;
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

  //#region getEmptyExEdition
  /**
   * 空のエディションの要素を取得する
   * @returns 
   */
  private getEmptyExEdition(): ExEdition {
    return {
      edition: 0,
      title: '',
      text: '',
      create_timestamp: Timestamp.now(),
      article_id: this.getArticleId(),
    }
  }
  //#endregion

  //#region convertKaigyo
  /**
   * 改行コードに変換する
   * @param text 
   * @returns 
   */
  private convertKaigyo(text: string): string {
    let array: string[] = text.split("<p><br></p>");
    return array.join("\n");
  }
  //#endregion

  //#endregion

}
