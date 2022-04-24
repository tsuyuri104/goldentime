import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InputOfFrmArticle } from 'src/app/interfaces/component/input-of-frm-article';
import { ArticleService } from 'src/app/services/article.service';
import { UrdayinService } from 'src/app/services/urdayin.service';

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

  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region submit
  /**
   * データを保存する
   * @param btn 保存の種類
   */
  public submit(btn: string): void {

    const inputData: InputOfFrmArticle = this.frmArticle.value;

    this.sArticle.addArticle(this.sUrdayin.getSelectedUser(), inputData.title, inputData.article);

  }
  //#endregion

  //#endregion

}
