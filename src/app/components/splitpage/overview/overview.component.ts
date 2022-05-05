import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { InputOfFrmSearch } from 'src/app/interfaces/component/input-of-frm-search';
import { OverviewListRow } from 'src/app/interfaces/component/overview-list-row';
import { Summary } from 'src/app/interfaces/component/summary';
import { Jobs } from 'src/app/interfaces/document/jobs';
import { Urdayin } from 'src/app/interfaces/document/urdayin';
import { ConfigService } from 'src/app/services/config.service';
import { CSVService } from 'src/app/services/csv.service';
import { JobsService } from 'src/app/services/jobs.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { Encode } from 'src/app/types/encode';
import { Common } from 'src/app/utilities/common';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  //#region 変数

  public memberData: Urdayin[] = [];
  public list: OverviewListRow[] = [];
  public summary: Summary[] = [];
  public totalHours: number = 0;

  public frmSearch!: FormGroup;

  public optionYear: number[] = [];
  public optionMonth: number[] = [];

  //#endregion

  //#region コンストラクタ
  constructor(
    private sUrdayin: UrdayinService
    , private sJobs: JobsService
    , private sConfig: ConfigService
    , private sCsv: CSVService
    , private fb: FormBuilder) {
    //検索条件の初期化
    this.frmSearch = this.fb.group({
      user: [this.sUrdayin.getSelectedUser(), [Validators.required]],
      year: [new Date().getFullYear(), [Validators.required]],
      month: [new Date().getMonth() + 1, [Validators.required]],
    });
  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  public async ngOnInit(): Promise<void> {
    this.createOptions();
    this.memberData = await this.sUrdayin.getMemberData();

    //初期の検索
    this.search();
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region search
  /**
   * 検索処理
   * @returns 
   */
  public async search(): Promise<void> {

    const condition: InputOfFrmSearch = this.frmSearch.value;

    let rows: OverviewListRow[] = [];
    let summary: Summary[] = [];
    let totalHours: number = 0;

    //１ヶ月分のデータを取得する
    const jobDocs: Jobs[] = await this.sJobs.getDataOneMonth(condition.user, this.convertNumberToYearMonthString(condition.year, condition.month));

    jobDocs.forEach(job => {

      let targetRowIndex: number = rows.findIndex(row => row.groupName === job.group_name && row.job === job.job);
      let targetRow: OverviewListRow = {
        groupName: job.group_name,
        job: job.job,
        hours: 0,
      }

      let targetSummaryIndex: number = summary.findIndex(datum => datum.groupName === job.group_name);
      let targetSummary: Summary = {
        groupName: job.group_name,
        hours: 0,
      }

      if (targetRowIndex > -1) {
        targetRow.hours = rows[targetRowIndex].hours;
      }

      if (targetSummaryIndex > -1) {
        targetSummary.hours = summary[targetSummaryIndex].hours;
      }

      targetRow.hours += job.hours;
      targetSummary.hours += job.hours;
      totalHours += job.hours;

      if (targetRowIndex > -1) {
        rows[targetRowIndex] = targetRow;
      } else {
        rows.push(targetRow);
      }

      if (targetSummaryIndex > -1) {
        summary[targetSummaryIndex] = targetSummary;
      } else {
        summary.push(targetSummary);
      }
    });

    //ソート
    rows = <OverviewListRow[]>this.sortByGroupName(rows);
    summary = <Summary[]>this.sortByGroupName(summary);

    this.list = rows;
    this.summary = summary;
    this.totalHours = totalHours;
  }
  //#endregion

  //#region exportCsv
  /**
   * CSVを出力する
   * @param e
   * @param encode
   */
  public async exportCsv(e: Event, encode: Encode): Promise<void> {

    const elm: HTMLElement = <HTMLElement>e.target;

    //ボタンのデータ属性を取得する
    const year: string | unknown = elm.getAttribute("data-year");
    const month: string | unknown = elm.getAttribute("data-month");
    const user: string | unknown = elm.getAttribute("data-user");

    //出力対象の年月を取得する
    const yearmonth: string = this.convertNumberToYearMonthString(<number>year, <number>month);

    //出力対象のデータを取得する
    const contents: string[][] = await this.sJobs.getDataForCsv(<string>user, yearmonth);

    //月の最終日を取得する
    const lastDate: Date = Common.getLastDateFromYearMonth(yearmonth);
    const daysInMonth: number = lastDate.getDate();

    //CSVフォーマットとして文字連結する
    const colsLength: number = daysInMonth + 2;
    let strCsvValue: string = "";
    contents.forEach(content => {
      strCsvValue += this.sCsv.convertStringCsvLine(content, colsLength, "0");
    });

    //出力する
    this.sCsv.download(strCsvValue, "工数一覧_" + Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()), encode);
  }
  //#endregion

  //#region createOptions
  /**
   * オプションの選択肢を作成する
   */
  private createOptions(): void {
    //年
    const nowYear: number = new Date().getFullYear();
    for (let i = this.sConfig.registerStartYear; i < nowYear + 1; i++) {
      this.optionYear.push(i);
    }

    //月
    for (let i = 0; i < 12; i++) {
      this.optionMonth.push(i + 1);
    }
  }
  //#endregion

  //#region convertNumberToYearMonthString
  /**
   * 数値から文字列に年月を変換する
   * @param year 
   * @param month 
   * @returns 
   */
  private convertNumberToYearMonthString(year: number, month: number): string {
    return (year).toString() + ("0" + month).slice(-2).toString();
  }
  //#endregion

  //#region sortByGroupName
  /**
   * 集約グループ名でソートする
   * @param arg 
   * @returns 
   */
  private sortByGroupName(arg: Summary[] | OverviewListRow[]): Summary[] | OverviewListRow[] {
    return arg.sort((a, b) => {
      if (a.groupName > b.groupName) {
        return 1;
      }

      if (a.groupName < b.groupName) {
        return -1;
      }
      return 0;
    });
  }
  //#endregion

  //#endregion
}
