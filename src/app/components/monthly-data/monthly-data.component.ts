import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Calendar } from 'src/app/interfaces/calendar';
import { CalendarDay } from 'src/app/interfaces/calendar-day';
import { CalendarRow } from 'src/app/interfaces/calendar-row';
import { Dailys } from 'src/app/interfaces/dailys';
import { Jobs } from 'src/app/interfaces/jobs';
import { Monthly } from 'src/app/interfaces/monthly';
import { DailyService } from 'src/app/services/daily.service';
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

  public selectedMonth: Date = new Date();
  public calendar: Calendar = { rows: [] };
  public monthly: Monthly = { total: 0 };
  public dailys: Dailys = {};
  public summaryData: Jobs[] = [];

  private subscriptionMonthly!: Subscription;
  private subscriptionSummary!: Subscription;
  private subscriptionDailys!: Subscription;

  //#endregion

  //#region コンストラクタ
  constructor(private sMonthly: MonthlyService, private sDaily: DailyService, private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  ngOnInit(): void {
    this.createCalender();
    this.getMonthlyData();
    this.getSummaryData();
    this.getDailysData();

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
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region setSelectedDate
  /**
   * 対象日を設定する
   * @param date カレンダーの日にち
   */
  public setSelectedDate(date: number): void {

  }
  //#endregion

  //#region createCalender
  /**
   * カレンダーを作成する
   */
  private createCalender() {
    let calender: Calendar = { rows: [] }

    //月の一日を取得する
    const firstDate: Date = this.getFirstDate();

    //月の最終日を取得する
    const lastDate: Date = this.getLastDate();

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
      const tmpDate: Date = this.addDate(firstDate, i);
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
    this.monthly = <Monthly>await this.sMonthly.getMonthlyData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.selectedMonth));
  }
  //#endregion

  //#region getSummaryData
  /**
   * サマリーデータを取得する
   */
  private async getSummaryData(): Promise<void> {
    this.summaryData = await this.sMonthly.getSummaryData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.selectedMonth));
  }
  //#endregion

  //#region getDailysData
  /**
   * １ヶ月分の日次データを取得する
   */
  private async getDailysData(): Promise<void> {
    this.dailys = await this.sDaily.getDailysData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.selectedMonth));
  }
  //#endregion

  //#region addDate
  /**
   * 日付を加算する
   * @param date 元になる日付
   * @param addDays 加算日数
   * @returns 加算した日付
   */
  private addDate(date: Date, addDays: number): Date {
    var date = new Date(date.valueOf());
    date.setDate(date.getDate() + addDays);
    return date;
  }
  //#endregion

  //#region getFirstDate
  /**
   * 月の初日を取得する
   * @returns 月の初日
   */
  private getFirstDate(): Date {
    let year: number = this.selectedMonth.getFullYear();
    let month: number = this.selectedMonth.getMonth();

    return new Date(year, month, 1);
  }
  //#endregion

  //#region getLastDate
  /**
   * 月の最終日を取得する
   * @returns 月の最終日
   */
  private getLastDate(): Date {
    let year: number = this.selectedMonth.getFullYear();
    let month: number = this.selectedMonth.getMonth() + 1;

    return new Date(year, month, 0);
  }
  //#endregion

  //#endregion
}
