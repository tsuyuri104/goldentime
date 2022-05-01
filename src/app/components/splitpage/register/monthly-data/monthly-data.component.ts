import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Calendar } from 'src/app/interfaces/component/calendar';
import { CalendarDay } from 'src/app/interfaces/component/calendar-day';
import { CalendarRow } from 'src/app/interfaces/component/calendar-row';
import { DailyKeyValue } from 'src/app/interfaces/document/daily-key-value';
import { Monthly } from 'src/app/interfaces/document/monthly';
import { DailyService } from 'src/app/services/daily.service';
import { HolidayService } from 'src/app/services/holiday.service';
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
  public dailys: DailyKeyValue = {};

  private subscriptionMonthly!: Subscription;
  private subscriptionDailys!: Subscription;
  private subscriptionSelectedDate!: Subscription;

  //#endregion

  //#region コンストラクタ
  constructor(
    private sMonthly: MonthlyService
    , private sDaily: DailyService
    , private sUrdayin: UrdayinService
    , private sHoliday: HolidayService) {

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

    //前後の月の空のセルをクリックした場合は処理しない
    if (fullDate === "") {
      return;
    }

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

  //#region procInit
  /**
   * 初期表示処理
   */
  private procInit(): void {
    this.selectedDateForDisply = this.sUrdayin.getSelectedDate();
    this.createCalender();
    this.getMonthlyData();
    this.getDailysData();
  }
  //#endregion

  //#region createCalender
  /**
   * カレンダーを作成する
   */
  private async createCalender() {

    //カレンダーの横幅をキープするために１週間分の空白データを設定する
    let dummy: Calendar = { rows: [] };
    let dummyRow: CalendarRow = { days: [] };
    if (this.calendar.rows.length === 0) {
      // カレンダーデータがない場合にダミーデータを設定する
      for (let i = 0; i < 7; i++) {
        dummyRow.days.push(this.getEmptyCalendarDay());
      }
      dummy.rows.push(dummyRow);
      this.calendar = dummy;
    }

    let calender: Calendar = { rows: [] };

    //月の一日を取得する
    const firstDate: Date = Common.getFirstDate(this.sUrdayin.getSelectedDate());

    //月の最終日を取得する
    const lastDate: Date = Common.getLastDate(this.sUrdayin.getSelectedDate());

    //祝日を取得する
    const date: Date = this.sUrdayin.getSelectedDate();
    const holiday: string[] = await this.sHoliday.getHolidayData(Common.dateToStringYearMonth(date));

    //カレンダーの１行分の情報を格納する
    let row: CalendarRow = { days: [] };

    //カレンダーの１行目の先月分の箇所に空白を設定する
    const firstDayOfWeek: number = firstDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      row.days.push(this.getEmptyCalendarDay());
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
      const isHoliday: boolean = holiday.findIndex(h => h === Common.dateToString(tmpDate)) > -1;

      row.days.push(<CalendarDay>{
        date: tmpDate.getDate(),
        isSunday: isSunday,
        isSaturday: isSaturday,
        isBlank: false,
        fullDate: Common.dateToString(tmpDate),
        isHoliday: isHoliday,
      });
    }

    //カレンダーの最終行の来月分の箇所に空白を設定する
    const lastDayOfWeek: number = lastDate.getDay();
    for (let i = lastDayOfWeek; i < 7; i++) {
      row.days.push(this.getEmptyCalendarDay());
    }

    calender.rows.push(row);

    this.calendar = calender;
  }
  //#endregion

  private getEmptyCalendarDay(): CalendarDay {
    return {
      date: 0,
      isSunday: false,
      isSaturday: false,
      isBlank: true,
      fullDate: "",
      isHoliday: false,
    };
  }

  //#region getMonthlyData
  /**
   * 月次データを取得する
   */
  private async getMonthlyData(): Promise<void> {
    this.monthly = <Monthly>await this.sMonthly.getMonthlyData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
  }
  //#endregion

  //#region getDailysData
  /**
   * １ヶ月分の日次データを取得する
   */
  private async getDailysData(): Promise<void> {
    this.dailys = this.sDaily.convertDailyKeyValueInterface(await this.sDaily.getDataOneMonth(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate())));
  }
  //#endregion

  //#endregion
}
