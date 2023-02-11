import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Daily } from 'src/app/interfaces/document/daily';
import { Jobs } from 'src/app/interfaces/document/jobs';
import { DailyService } from 'src/app/services/daily.service';
import { JobsService } from 'src/app/services/jobs.service';
import { MonthlyService } from 'src/app/services/monthly.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { GroupName } from 'src/app/interfaces/document/group-name';
import { GroupNameService } from 'src/app/services/group-name.service';
import { DateUtil } from 'src/app/utilities/date-util';
import { map, mergeMap } from 'rxjs';
import { HolidayService } from 'src/app/services/holiday.service';
import { DateInfo } from 'src/app/interfaces/component/date-info';

@Component({
  selector: 'app-daily-data',
  templateUrl: './daily-data.component.html',
  styleUrls: ['./daily-data.component.scss']
})
export class DailyDataComponent implements OnInit {

  //#region 変数

  public selectedDate: DateInfo = new DateInfo(this.sHoliday);
  public dailyTotalHours: number = 0;
  public listGroup: GroupName[] = [];

  /**
   * 入力項目
   */
  public frmDaily: UntypedFormGroup = this.fb.group({
    memo: '',
    jobs: this.fb.array([this.createJob()])
  });
  public jobs: UntypedFormArray = new UntypedFormArray([]);

  //#endregion

  //#region コンストラクタ
  constructor(
    private sDaily: DailyService
    , private sMonthly: MonthlyService
    , private sUrdayin: UrdayinService
    , private sJobs: JobsService
    , private sGroupName: GroupNameService
    , private fb: UntypedFormBuilder
    , private toastr: ToastrService
    , private sHoliday: HolidayService
  ) {

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

  //#region getJobsArray
  /**
   * フォームから仕事配列を取得する
   */
  public getJobsArray() {
    return this.frmDaily.get("jobs") as UntypedFormArray
  }
  //#endregion

  //#region addJobCard
  /**
   * 仕事カードを追加する
   */
  public addJobCard(): void {
    this.jobs = this.getJobsArray()
    this.jobs.push(this.createJob());
  }
  //#endregion

  //#region deleteJobCard
  /**
   * 仕事カードを削除する
   */
  public deleteJobCard(index: number): void {
    this.jobs = this.getJobsArray();
    this.jobs.removeAt(index);
    this.setTotalHours();
  }
  //#endregion

  //#region setTotalHours
  /**
   * 一日の合計時間を設定する
   */
  public setTotalHours(): void {
    this.dailyTotalHours = this.calcTotalHours();
  }
  //#endregion

  //#region updateDailyData
  /**
   * 日次データを更新する
   */
  public async updateDailyData(): Promise<void> {
    let inputData: Daily = this.frmDaily.value;
    const email: string = this.sUrdayin.getSelectedUser();
    const yearmonth: string = DateUtil.toStringYearMonth(this.sUrdayin.getSelectedDate());
    const date: string = DateUtil.toString(this.sUrdayin.getSelectedDate());
    inputData.total = this.calcTotalHours();

    //日次データを更新する
    await this.sDaily.deleteInsertDocs(inputData, email, date);

    //仕事データを更新する
    this.sJobs.insertJobData(inputData, email, date);

    //集約グループを更新する
    this.sGroupName.insertData(inputData, email);

    //１ヶ月分の日次データを取得する
    this.sDaily.getDataOneMonth(email, yearmonth)
      .subscribe(dailyDataOneMonth => {
        //月次データのトータルを更新する
        this.sMonthly.updateMonthlyTotal(email, yearmonth, dailyDataOneMonth);
      });

    ///成功
    this.toastr.success("登録しました");

  }
  //#endregion

  //#region setSelectedDate
  /**
   * 対象日を設定する
   * @param range 変更日数
   */
  public setSelectedDate(range: number): void {
    const date: Date = DateUtil.addDate(this.sUrdayin.getSelectedDate(), range);
    this.sUrdayin.onSharedSelectedDateChanged(date);
  }
  //#endregion

  //#region procInit
  /**
   * 初期表示処理
   */
  private async procInit(): Promise<void> {
    const date: Date = this.sUrdayin.getSelectedDate();
    await this.selectedDate.Set(date);
    this.getDailyData(this.sUrdayin.getSelectedUser(), DateUtil.toString(date));
    this.getGroupNameData();
  }
  //#endregion

  //#region getGroupNameData
  /**
   * グループ名を取得する
   */
  private getGroupNameData(): void {
    this.sGroupName.getData(this.sUrdayin.getSelectedUser())
      .subscribe(data => {
        this.listGroup = data;
      });
  }
  //#endregion

  //#region getDailyData
  /**
   * 日次データを取得する
   * @param email 対象のユーザーのメールアドバイス
   * @param date 対象の年月日
   */
  private async getDailyData(email: string, date: string): Promise<void> {
    //日次データを取得する
    this.sDaily.getData(email, date)
      .pipe(
        mergeMap((daily: Daily) => {
          //仕事データを取得する
          return this.sJobs.getData(email, date)
            .pipe(
              map((jobs: Jobs[]) => {
                // 日次データと仕事データを返す
                return { daily, jobs };
              })
            )
        })
      )
      .subscribe(arg => {
        this.frmDaily = this.convertFormGroup(arg.daily, arg.jobs);
        this.dailyTotalHours = (arg.daily).total;
      });
  }
  //#endregion

  //#region calcTotalHours
  /**
   * 一日の合計時間を算出する
   * @returns 一日の合計時間
   */
  private calcTotalHours(): number {
    const jobs = this.frmDaily.get('jobs') as UntypedFormArray;
    let counter: number = 0;
    jobs.controls.forEach(c => {
      counter += Number(c.value.hours);
    });
    return counter;
  }
  //#endregion

  //#region createJob
  /**
   * 空の仕事配列の要素を作成する
   * @returns 仕事配列の要素
   */
  private createJob(): UntypedFormGroup {
    return this.fb.group(<Jobs>{
      job: '',
      hours: 0,
      group_name: '',
    });
  }
  //#endregion

  //#region convertFormGroup
  /**
   * DBから取得した仕事情報を、フォームグループに変換する
   * @param datum 取得した仕事情報
   * @returns フォームグループに変換した仕事情報
   */
  private convertFormGroup(datum: Daily, jobs: Jobs[]): UntypedFormGroup {
    let group = this.fb.group({
      memo: datum.memo,
      total: datum.total,
      jobs: this.fb.array(this.convertFormArray(jobs)),
    });

    return group;
  }
  //#endregion

  //#region convertFormArray
  /**
   * 仕事配列をフォームグループ型に変換する
   * @param data 仕事配列
   * @returns フォームグループに変換した仕事配列
   */
  private convertFormArray(data: Jobs[]): UntypedFormGroup[] {
    let arr: UntypedFormGroup[] = [];

    data.forEach(datum => {
      arr.push(this.fb.group(<Jobs>{
        job: datum.job,
        hours: datum.hours,
        group_name: datum.group_name,
      }));
    });

    return arr;
  }
  //#endregion

  //#endregion
}
