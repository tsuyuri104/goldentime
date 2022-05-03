import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QuillModules } from "ngx-quill";
import { ArticleData } from 'src/app/interfaces/component/article-data';
import { InputOfFrmArticle } from 'src/app/interfaces/component/input-of-frm-article';
import { QuillConfiguration } from 'src/app/modules/quill-configuration/quill-configuration.module';
import { ArticleService } from 'src/app/services/article.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { ArticleStatus } from 'src/app/types/article-status';

@Component({
  selector: 'app-report-editor',
  templateUrl: './report-editor.component.html',
  styleUrls: ['./report-editor.component.scss']
})

export class ReportEditorComponent implements OnInit {

  //#region 変数

  public frmArticle: FormGroup = this.fb.group({
    title: '',
    article: '',
  });

  public quillConfiguration: QuillModules = QuillConfiguration;
  public isDisplayPrivateButton: boolean = false;

  //#endregion

  //#region コンストラクタ
  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    private sArticle: ArticleService,
    private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  public ngOnInit(): void {
    this.procInit();
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region submit
  /**
   * データを保存する
   * @param btn 保存の種類
   */
  public submit(btn: ArticleStatus): void {

    const inputData: InputOfFrmArticle = this.frmArticle.value;

    if (this.isNewArticle()) {
      // 新規作成の場合
      this.sArticle.addArticle(this.sUrdayin.getSelectedUser(), inputData.title, inputData.article, btn);
    } else {
      // 編集の場合 
      this.sArticle.updateArticle(this.getArticleId(), inputData.title, inputData.article, btn);
    }

    //公開した場合は、下書きボタンを表示しない
    if (btn === "public") {
      this.isDisplayPrivateButton = false;
    }
  }
  //#endregion

  //#region procInit
  /**
   * 初期設定
   */
  private procInit(): void {
    if (this.isNewArticle()) {
      //新規作成の場合
      this.isDisplayPrivateButton = true;
    } else {
      //編集の場合
      this.getArticleData();
    }
  }
  //#endregion

  //#region getArticleData
  /**
   * 記事データを取得する
   */
  private async getArticleData(): Promise<void> {
    const id: string = this.getArticleId();
    const email: string = this.sUrdayin.getSelectedUser();
    let article: ArticleData = await this.sArticle.getArticleData(id, email);
    this.frmArticle = this.fb.group({
      title: article.text.title,
      article: article.text.text
    });
    this.isDisplayPrivateButton = article.article.status === "private";
  }
  //#endregion

  //#region isNewArticle
  /**
   * 新規登録か判定する
   * @returns 
   */
  private isNewArticle(): boolean {
    return this.getArticleId() === "new";
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
