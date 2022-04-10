import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Daily } from 'src/app/interfaces/document/daily';
import { Jobs } from 'src/app/interfaces/document/jobs';
import { Monthly } from 'src/app/interfaces/document/monthly';
import { DailyService } from 'src/app/services/daily.service';
import { JobsService } from 'src/app/services/jobs.service';
import { MonthlyService } from 'src/app/services/monthly.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { Common } from 'src/app/utilities/common';
import { GroupName } from 'src/app/interfaces/document/group-name';
import { GroupNameService } from 'src/app/services/group-name.service';

@Component({
  selector: 'app-daily-data',
  templateUrl: './daily-data.component.html',
  styleUrls: ['./daily-data.component.scss']
})
export class DailyDataComponent implements OnInit, OnDestroy {

  //#region 変数

  public selectedDateForDisply: Date = new Date();
  public dailyTotalHours: number = 0;
  public submitMessage: string = "";
  public listGroup: GroupName[] = [];

  private subscriptionSelectedDate!: Subscription;

  /**
   * 入力項目
   */
  public frmDaily: FormGroup = this.fb.group({
    memo: '',
    jobs: this.fb.array([this.createJob()])
  });
  public jobs: FormArray = new FormArray([]);

  //#endregion

  //#region コンストラクタ
  constructor(
    private sDaily: DailyService
    , private sMonthly: MonthlyService
    , private sUrdayin: UrdayinService
    , private sJobs: JobsService
    , private sGroupName: GroupNameService
    , private fb: FormBuilder
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

    this.subscriptionSelectedDate = this.sUrdayin.sharedSelectedDateDataSource$.subscribe(
      data => {
        //対象日が変更された場合は、初期表示を行う
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
    this.subscriptionSelectedDate.unsubscribe();
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region getJobsArray
  /**
   * フォームから仕事配列を取得する
   */
  public getJobsArray() {
    return this.frmDaily.get("jobs") as FormArray
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
    this.submitMessage = "";
    let inputData: Daily = this.frmDaily.value;
    const email: string = this.sUrdayin.getSelectedUser();
    const yearmonth: string = Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate());
    const date: string = Common.dateToString(this.sUrdayin.getSelectedDate());
    inputData.total = this.calcTotalHours();

    //日次データを更新する
    await this.sDaily.deleteInsertDocs(inputData, email, date);

    //仕事データを更新する
    this.sJobs.insertJobData(inputData, email, date);

    //集約グループを更新する
    this.sGroupName.insertData(inputData, email);

    //１ヶ月分の日次データを取得する
    let dailyDataOneMonth = await this.sDaily.getDataOneMonth(email, yearmonth);

    //月次データのトータルを更新する
    this.sMonthly.updateMonthlyTotal(email, yearmonth, dailyDataOneMonth)
      .then(async arg => {
        //月次データを再取得する
        const newMonthly = <Monthly>await this.sMonthly.getMonthlyData(email, yearmonth);
        //サービスに新しい月次データを渡す
        this.sUrdayin.onSharedMonthlyDataChanged(newMonthly);
      });

    //サマリーデータを再取得する
    const newSummary = <Jobs[]>await this.sMonthly.getSummaryData(email, yearmonth);
    //サービスに新しいサマリーデータを渡す
    this.sUrdayin.onSharedSummaryDataChanged(newSummary);

    //１ヶ月の日次データを再取得する
    const newDailys = this.sDaily.convertDailyKeyValueInterface(dailyDataOneMonth);
    //サービスに１ヶ月の日次データを渡す
    this.sUrdayin.onSharedDailyDataChanged(newDailys);

    ///成功
    this.submitMessage = "Successed submit";

  }
  //#endregion

  //#region setSelectedDate
  /**
   * 対象日を設定する
   * @param range 変更日数
   */
  public setSelectedDate(range: number): void {
    const date: Date = Common.addDate(this.sUrdayin.getSelectedDate(), range);
    this.sUrdayin.onSharedSelectedDateChanged(date);
  }
  //#endregion

  //#region procInit
  /**
   * 初期表示処理
   */
  private procInit(): void {
    this.selectedDateForDisply = this.sUrdayin.getSelectedDate();
    this.getDailyData(this.sUrdayin.getSelectedUser(), Common.dateToString(this.sUrdayin.getSelectedDate()));
    this.getGroupNameData();
  }
  //#endregion

  //#region getGroupNameData
  /**
   * グループ名を取得する
   */
  private async getGroupNameData(): Promise<void> {
    this.listGroup = await this.sGroupName.getData(this.sUrdayin.getSelectedUser());
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
    const dailyData = this.setInitValueDaily(<Daily>await this.sDaily.getData(email, date));

    //仕事データを取得する
    let jobs: Jobs[] = await this.sJobs.getData(email, date);
    jobs = this.setInitValueJobs(jobs);

    this.frmDaily = this.convertFormGroup(dailyData, jobs);
    this.dailyTotalHours = dailyData.total;
  }
  //#endregion

  //#region calcTotalHours
  /**
   * 一日の合計時間を算出する
   * @returns 一日の合計時間
   */
  private calcTotalHours(): number {
    const jobs = this.frmDaily.get('jobs') as FormArray;
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
  private createJob(): FormGroup {
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
  private convertFormGroup(datum: Daily, jobs: Jobs[]): FormGroup {
    let group = this.fb.group({
      memo: datum.memo,
      total: datum.total,
      jobs: this.fb.array(this.convertFormArray(jobs)),
    });

    return group;
  }
  //#endregion

  //#region setInitValueDaily
  /**
   * 日次データの初期値を設定する
   * @param datum 日次データ
   * @returns 
   */
  private setInitValueDaily(datum: Daily): Daily {
    if (datum === undefined) {
      datum = {
        total: 0,
        memo: ""
      }
    }
    return datum;
  }
  //#endregion

  //#region setInitValueJobs
  /**
   * 仕事データの初期値を設定する
   * @param data 
   * @returns 
   */
  private setInitValueJobs(data: Jobs[]): Jobs[] {
    if (data.length === 0) {
      data.push({
        job: "",
        hours: 0,
        user: "",
        date: "",
        group_name: "",
      });
    }
    return data;
  }
  //#endregion

  //#region convertFormArray
  /**
   * 仕事配列をフォームグループ型に変換する
   * @param data 仕事配列
   * @returns フォームグループに変換した仕事配列
   */
  private convertFormArray(data: Jobs[]): FormGroup[] {
    let arr: FormGroup[] = [];

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
