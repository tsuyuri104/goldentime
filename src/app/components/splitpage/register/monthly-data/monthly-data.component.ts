import { Component, OnInit } from '@angular/core';
import { Calendar } from 'src/app/interfaces/component/calendar';
import { CalendarDay } from 'src/app/interfaces/component/calendar-day';
import { CalendarRow } from 'src/app/interfaces/component/calendar-row';
import { DailyKeyValue } from 'src/app/interfaces/document/daily-key-value';
import { Monthly } from 'src/app/interfaces/document/monthly';
import { ConfigService } from 'src/app/services/config.service';
import { DailyService } from 'src/app/services/daily.service';
import { HolidayService } from 'src/app/services/holiday.service';
import { MonthlyService } from 'src/app/services/monthly.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { DateUtil } from 'src/app/utilities/date-util';

@Component({
  selector: 'app-monthly-data',
  templateUrl: './monthly-data.component.html',
  styleUrls: ['./monthly-data.component.scss']
})
export class MonthlyDataComponent implements OnInit {

  //#region 変数

  public selectedDateForDisply: Date = new Date();
  public calendar: Calendar = { rows: [] };
  public monthly: Monthly = { total: 0 };
  public dailys: DailyKeyValue = {};

  //#endregion

  //#region コンストラクタ
  constructor(
    private sMonthly: MonthlyService
    , private sDaily: DailyService
    , private sUrdayin: UrdayinService
    , private sHoliday: HolidayService
    , private sConfig: ConfigService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  ngOnInit(): void {
    this.procInit();

    // 監視対象の設定
    this.sUrdayin.sharedSelectedDateDataSource$
      .subscribe(
        arg => {
          //対象の日付が変更された場合は、初期表示を行う
          this.procInit();
        }
      );
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

    const date: Date = DateUtil.toDate(fullDate);
    this.sUrdayin.onSharedSelectedDateChanged(date);
  }
  //#endregion

  //#region setSelectedMonth
  /**
   * 対象の月を設定する
   * @param range 現在選択している月からの移動月数
   */
  public setSelectedMonth(range: number): void {
    const nowDate: Date = DateUtil.getFirstDate(this.sUrdayin.getSelectedDate());
    const y: number = nowDate.getFullYear();
    const m: number = nowDate.getMonth();
    const d: number = nowDate.getDate();
    const newDate: Date = new Date(y, m + range, d);

    //最小年より前の場合は変更させない
    if (this.sConfig.registerStartYear > newDate.getFullYear()) {
      return;
    }

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
    return day === DateUtil.toString(this.sUrdayin.getSelectedDate());
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
    const firstDate: Date = DateUtil.getFirstDate(this.sUrdayin.getSelectedDate());

    //月の最終日を取得する
    const lastDate: Date = DateUtil.getLastDate(this.sUrdayin.getSelectedDate());

    //祝日を取得する
    const date: Date = this.sUrdayin.getSelectedDate();
    const holiday: string[] = await this.sHoliday.getHolidayData(DateUtil.toStringYearMonth(date));

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
      const tmpDate: Date = DateUtil.addDate(firstDate, i);
      const dayOfWeek: number = tmpDate.getDay();

      //日曜日の場合
      if (dayOfWeek === 0) {
        calender.rows.push(row);
        row = { days: [] };
      }

      const isSunday: boolean = dayOfWeek === 0;
      const isSaturday: boolean = dayOfWeek === 6;
      const isHoliday: boolean = holiday.findIndex(h => h === DateUtil.toString(tmpDate)) > -1;

      row.days.push(<CalendarDay>{
        date: tmpDate.getDate(),
        isSunday: isSunday,
        isSaturday: isSaturday,
        isBlank: false,
        fullDate: DateUtil.toString(tmpDate),
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

  //#region getEmptyCalendarDay
  /**
   * カレンダーの空用データを取得する
   * @returns 空用データ
   */
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
  //#endregion

  //#region getMonthlyData
  /**
   * 月次データを取得する
   */
  private getMonthlyData(): void {
    this.sMonthly.getMonthlyData(this.sUrdayin.getSelectedUser(), DateUtil.toStringYearMonth(this.sUrdayin.getSelectedDate()))
      .subscribe(data => {
        this.monthly = <Monthly>data;
      });
  }
  //#endregion

  //#region getDailysData
  /**
   * １ヶ月分の日次データを取得する
   */
  private async getDailysData(): Promise<void> {
    this.sDaily.getDataOneMonth(this.sUrdayin.getSelectedUser(), DateUtil.toStringYearMonth(this.sUrdayin.getSelectedDate()))
      .subscribe(data => {
        this.dailys = this.sDaily.convertDailyKeyValue(data);
      });
  }
  //#endregion

  //#endregion
}
