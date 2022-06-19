import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { ArticleData } from 'src/app/interfaces/component/article-data';
import { ExEdition } from 'src/app/interfaces/component/ex-edition';
import { InputOfFrmVersion } from 'src/app/interfaces/component/input-of-frm-version';
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
  public afterVersion: number = 0;
  public before: ExEdition = this.getEmptyExEdition();
  public beforeVersion: number = 0;
  public versionOptions: number[] = [];
  public frmVersion!: FormGroup;

  //#endregion

  //#region コンストラクタ
  constructor(private route: ActivatedRoute,
    private sEditions: EditionsService,
    private sArticle: ArticleService,
    private sUrdayin: UrdayinService,
    private fb: FormBuilder) {
    //検索条件の初期化
    this.frmVersion = this.fb.group({
      version: 0,
    });
  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  public async ngOnInit(): Promise<void> {
    this.setInit();
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region setText
  /**
   * テキストをエレメントに設定する
   */
  public setText(): void {
    const condition: InputOfFrmVersion = this.frmVersion.value;
    const id: string = this.getArticleId();

    this.getArticle(id, this.afterVersion, Number(condition.version));
  }
  //#endregion

  //#region setInit
  /**
   * 初期設定
   */
  private async setInit(): Promise<void> {
    const id: string = this.getArticleId();
    const article: ArticleData = await this.sArticle.getArticleData(id, this.sUrdayin.getSelectedUser());
    const lastEdition: number = article.article.last_edition;

    this.getArticle(id, lastEdition, lastEdition - 1);
    this.setVersionOptions(lastEdition);

    this.afterVersion = lastEdition;

    this.frmVersion = this.fb.group({
      version: lastEdition - 1,
    });
  }
  //#endregion

  //#region setVersionOptions
  /**
   * バージョンの選択肢を設定する
   * @param lastEdition 
   */
  private setVersionOptions(lastEdition: number): void {
    let ops: number[] = [];

    for (let i = lastEdition - 1; i > 0; i--) {
      ops.push(i);
    }

    this.versionOptions = ops;
  }
  //#endregion

  //#region getArticle
  /**
   * 記事データを取得する
   */
  private async getArticle(id: string, afterVersion: number, beforeVersion: number): Promise<void> {

    let after: ExEdition = await this.sEditions.getEdition(id, afterVersion);
    let before: ExEdition = await this.sEditions.getEdition(id, beforeVersion);

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
