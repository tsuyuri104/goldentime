import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Calendar } from 'src/app/interfaces/calendar';
import { CalendarDay } from 'src/app/interfaces/calendar-day';
import { CalendarRow } from 'src/app/interfaces/calendar-row';
import { Dailys } from 'src/app/interfaces/dailys';
import { Jobs } from 'src/app/interfaces/jobs';
import { Monthly } from 'src/app/interfaces/monthly';
import { CSVService } from 'src/app/services/csv.service';
import { DailyService } from 'src/app/services/daily.service';
import { JobsService } from 'src/app/services/jobs.service';
import { MonthlyService } from 'src/app/services/monthly.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { Common } from 'src/app/utilities/common';

@Component({
  selector: 'app-monthly-data',
  templateUrl: './monthly-data.component.html',
  styleUrls: ['./monthly-data.component.scss']
})
export class MonthlyDataComponent implements OnInit, OnDestroy {

  //#region 変数

  public selectedDateForDisply: Date = new Date();
  public calendar: Calendar = { rows: [] };
  public monthly: Monthly = { total: 0 };
  public dailys: Dailys = {};
  public summaryData: Jobs[] = [];

  private subscriptionMonthly!: Subscription;
  private subscriptionSummary!: Subscription;
  private subscriptionDailys!: Subscription;
  private subscriptionSelectedDate!: Subscription;

  //#endregion

  //#region コンストラクタ
  constructor(
    private sMonthly: MonthlyService
    , private sDaily: DailyService
    , private sUrdayin: UrdayinService
    , private sJobs: JobsService
    , private sCsv: CSVService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  ngOnInit(): void {
    this.procInit();

    //監視対象の設定
    this.subscriptionMonthly = this.sUrdayin.sharedMonthlyDataSource$.subscribe(
      data => {
        //月次データの表示を更新する
        this.monthly = data;
      }
    );
    this.subscriptionSummary = this.sUrdayin.sharedSummaryDataSource$.subscribe(
      data => {
        //サマリーデータの表示を更新する
        this.summaryData = data;
      }
    )
    this.subscriptionDailys = this.sUrdayin.sharedDailysDataSource$.subscribe(
      data => {
        //１ヶ月分の日次データを更新する
        this.dailys = data;
      }
    )
    this.subscriptionSelectedDate = this.sUrdayin.sharedSelectedDateDataSource$.subscribe(
      data => {
        //対象の日付が変更された場合は、初期表示を行う
        this.procInit();
      }
    );
  }
  //#endregion

  //#region ngOnDestroy
  /**
   * 破棄設定
   */
  ngOnDestroy(): void {
    this.subscriptionMonthly.unsubscribe();
    this.subscriptionSummary.unsubscribe();
    this.subscriptionDailys.unsubscribe();
    this.subscriptionSelectedDate.unsubscribe();
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region setSelectedDate
  /**
   * 対象日を設定する
   * @param date カレンダーの日にち
   */
  public setSelectedDate(fullDate: string): void {
    const date: Date = Common.stringToDate(fullDate);
    this.sUrdayin.onSharedSelectedDateChanged(date);
  }
  //#endregion

  //#region setSelectedMonth
  /**
   * 対象の月を設定する
   * @param range 現在選択している月からの移動月数
   */
  public setSelectedMonth(range: number): void {
    const nowDate: Date = Common.getFirstDate(this.sUrdayin.getSelectedDate());
    const y: number = nowDate.getFullYear();
    const m: number = nowDate.getMonth();
    const d: number = nowDate.getDate();
    const newDate: Date = new Date(y, m + range, d);
    this.sUrdayin.onSharedSelectedDateChanged(newDate);
  }
  //#endregion

  //#region isSelectedDate
  /**
   * カレンダーの日付が対象の日付であるか判定する
   * @param day カレンダーの日付
   * @returns 真偽値
   */
  public isSelectedDate(day: string): boolean {
    return day === Common.dateToString(this.sUrdayin.getSelectedDate());
  }
  //#endregion

  //#region exportCsv
  /**
   * CSVを出力する
   */
  public async exportCsv(): Promise<void> {

    //出力対象のデータを取得する
    const contents: string[][] = await this.sJobs.getDataForCsv(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));

    //月の最終日を取得する
    const lastDate: Date = Common.getLastDate(this.sUrdayin.getSelectedDate());
    const daysInMonth: number = lastDate.getDate();

    //CSVフォーマットとして文字連結する
    const colsLength: number = daysInMonth + 1;
    let strCsvValue: string = "";
    contents.forEach(content => {
      strCsvValue += this.sCsv.convertStringCsvLine(content, colsLength, "0");
    });

    //出力する
    this.sCsv.download(strCsvValue, "工数一覧_" + Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
  }
  //#endregion

  //#region procInit
  /**
   * 初期表示処理
   */
  private procInit(): void {
    this.selectedDateForDisply = this.sUrdayin.getSelectedDate();
    this.createCalender();
    this.getMonthlyData();
    this.getSummaryData();
    this.getDailysData();
  }
  //#endregion

  //#region createCalender
  /**
   * カレンダーを作成する
   */
  private createCalender() {
    let calender: Calendar = { rows: [] }

    //月の一日を取得する
    const firstDate: Date = Common.getFirstDate(this.sUrdayin.getSelectedDate());

    //月の最終日を取得する
    const lastDate: Date = Common.getLastDate(this.sUrdayin.getSelectedDate());

    //カレンダーの１行分の情報を格納する
    let row: CalendarRow = { days: [] };

    //カレンダーの１行目の先月分の箇所に空白を設定する
    const firstDayOfWeek: number = firstDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      row.days.push(<CalendarDay>{
        date: 0,
        isSunday: false,
        isSaturday: false,
        isBlank: true,
        fullDate: "",
      });
    }

    //カレンダーの日付分を設定する
    const daysInMonth: number = lastDate.getDate();
    for (let i = 0; i < daysInMonth; i++) {

      //曜日を取得する
      const tmpDate: Date = Common.addDate(firstDate, i);
      const dayOfWeek: number = tmpDate.getDay();

      //日曜日の場合
      if (dayOfWeek === 0) {
        calender.rows.push(row);
        row = { days: [] };
      }

      const isSunday: boolean = dayOfWeek === 0;
      const isSaturday: boolean = dayOfWeek === 6;

      row.days.push(<CalendarDay>{
        date: tmpDate.getDate(),
        isSunday: isSunday,
        isSaturday: isSaturday,
        isBlank: false,
        fullDate: Common.dateToString(tmpDate),
      });
    }

    //カレンダーの最終行の来月分の箇所に空白を設定する
    const lastDayOfWeek: number = lastDate.getDay();
    for (let i = lastDayOfWeek; i < 7; i++) {
      row.days.push(<CalendarDay>{
        date: 0,
        isSunday: false,
        isSaturday: false,
        isBlank: true,
        fullDate: "",
      });
    }

    calender.rows.push(row);

    this.calendar = calender;
  }
  //#endregion

  //#region getMonthlyData
  /**
   * 月次データを取得する
   */
  private async getMonthlyData(): Promise<void> {
    this.monthly = <Monthly>await this.sMonthly.getMonthlyData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
  }
  //#endregion

  //#region getSummaryData
  /**
   * サマリーデータを取得する
   */
  private async getSummaryData(): Promise<void> {
    this.summaryData = await this.sMonthly.getSummaryData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
  }
  //#endregion

  //#region getDailysData
  /**
   * １ヶ月分の日次データを取得する
   */
  private async getDailysData(): Promise<void> {
    this.dailys = await this.sDaily.getDailysData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
  }
  //#endregion

  //#endregion
}
