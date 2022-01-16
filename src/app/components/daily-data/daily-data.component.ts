import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Daily } from 'src/app/interfaces/daily';
import { Dailys } from 'src/app/interfaces/dailys';
import { Jobs } from 'src/app/interfaces/jobs';
import { Monthly } from 'src/app/interfaces/monthly';
import { DailyService } from 'src/app/services/daily.service';
import { JobsService } from 'src/app/services/jobs.service';
import { MonthlyService } from 'src/app/services/monthly.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { Common } from 'src/app/utilities/common';

@Component({
  selector: 'app-daily-data',
  templateUrl: './daily-data.component.html',
  styleUrls: ['./daily-data.component.scss']
})
export class DailyDataComponent implements OnInit, OnDestroy {

  //#region 変数

  public selectedDateForDisply: Date = new Date();
  public selectedUserName: string = "";
  public dailyTotalHours: number = 0;
  public submitMessage: string = "";

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
  public updateDailyData(): void {
    this.submitMessage = "";
    let inputData: Daily = this.frmDaily.value;
    inputData.total = this.calcTotalHours();
    this.sDaily.deleteInsertDocs(inputData, this.sUrdayin.getSelectedUser(), Common.dateToString(this.sUrdayin.getSelectedDate()))
      .then(async arg => {
        //月次データのトータルを更新する
        await this.sMonthly.updateMonthlyTotal(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
        //月次データを再取得する
        const newMonthly = <Monthly>await this.sMonthly.getMonthlyData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
        //サービスに新しい月次データを渡す
        this.sUrdayin.onSharedMonthlyDataChanged(newMonthly);
        //サマリーデータを再取得する
        const newSummary = <Jobs[]>await this.sMonthly.getSummaryData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
        //サービスに新しいサマリーデータを渡す
        this.sUrdayin.onSharedSummaryDataChanged(newSummary);
        //１ヶ月の日次データを再取得する
        const newDailys = <Dailys>await this.sDaily.getDailysData(this.sUrdayin.getSelectedUser(), Common.dateToStringYearMonth(this.sUrdayin.getSelectedDate()));
        //サービスに１ヶ月の日次データを渡す
        this.sUrdayin.onSharedDailyDataChanged(newDailys);
        this.submitMessage = "Successed submit";
      });
  }
  //#endregion

  //#region procInit
  /**
   * 初期表示処理
   */
  private procInit(): void {
    this.selectedDateForDisply = this.sUrdayin.getSelectedDate();
    this.setDailyData(this.sUrdayin.getSelectedUser(), Common.dateToString(this.sUrdayin.getSelectedDate()));
    this.getUserName(this.sUrdayin.getSelectedUser());
  }
  //#endregion

  //#region setDailyData
  /**
   * 日次データを画面項目に設定する
   * @param email 対象のユーザーのメールアドバイス
   * @param date 対象の年月日
   */
  private async setDailyData(email: string, date: string): Promise<void> {
    //日次データを取得する
    const dailyData = this.setInitValueDaily(<Daily>await this.sDaily.getData(email, date));

    //仕事データを取得する
    const snaps = await this.sJobs.getData(email, date);
    let jobs: Jobs[] = [];
    snaps.forEach(snap => {
      jobs.push(<Jobs>snap.data());
    });
    jobs = this.setInitValueJobs(jobs);

    this.frmDaily = this.convertFormGroup(dailyData, jobs);
    this.dailyTotalHours = dailyData.total;
  }
  //#endregion

  //#region getUserName
  /**
   * 対象のユーザーの名前を取得する
   * @param email 対象のユーザーのメールアドレス
   */
  private async getUserName(email: string) {
    this.selectedUserName = await this.sUrdayin.getUserName(email);
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
      hours: 0
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
      jobs: this.fb.array(this.convertFormArray(jobs))
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
      }));
    });

    return arr;
  }
  //#endregion

  //#endregion
}
