import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModules } from "ngx-quill";
import { ToastrService } from 'ngx-toastr';
import { RouteName } from 'src/app/consts/route-name';
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

  public frmArticle!: FormGroup;

  public quillConfiguration: QuillModules = QuillConfiguration;
  public isDisplayPrivateButton: boolean = false;

  //#endregion

  //#region コンストラクタ
  constructor(
    private route: ActivatedRoute
    , private fb: FormBuilder
    , private sArticle: ArticleService
    , private sUrdayin: UrdayinService
    , private toastr: ToastrService
    , private router: Router) {
    // 記事用フォーム
    this.frmArticle = this.fb.group({
      title: '',
      article: '',
    });
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
  public async submit(btn: ArticleStatus): Promise<void> {

    const inputData: InputOfFrmArticle = this.frmArticle.value;
    let id: string = this.getArticleId();

    if (this.isNewArticle()) {
      // 新規作成の場合
      id = await this.sArticle.addArticle(this.sUrdayin.getSelectedUser(), inputData.title, inputData.article, btn);
    } else {
      // 編集の場合 
      this.sArticle.updateArticle(this.getArticleId(), inputData.title, inputData.article, btn);
    }

    //公開した場合は、下書きボタンを表示しない
    this.setDiesplayMode(btn);

    this.toastr.success("登録しました");

    //URLを書き換える
    const newUrl: string = "/" + RouteName.EDITOR + "/" + id;
    this.router.navigateByUrl(newUrl);
  }
  //#endregion

  //#region procInit
  /**
   * 初期設定
   */
  private procInit(): void {
    if (this.isNewArticle()) {
      //新規作成の場合
      this.setDiesplayMode("private");
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
    this.setDiesplayMode(article.article.status);
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

  //#region setDiesplayMode
  /**
   * 下書きボタン表示変数の値を設定する
   * @param status 
   */
  private setDiesplayMode(status: ArticleStatus): void {
    this.isDisplayPrivateButton = status === "private";
  }
  //#endregion

  //#endregion

}
