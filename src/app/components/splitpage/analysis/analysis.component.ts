import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormControlName } from '@angular/forms';
import { AnalysisBreakdown } from 'src/app/interfaces/component/analysis-breakdown';
import { AnalysisLeftDailyData } from 'src/app/interfaces/component/analysis-left-daily-data';
import { AnalysisRightJobsData } from 'src/app/interfaces/component/analysis-right-jobs-data';
import { AnalysisTopGroupData } from 'src/app/interfaces/component/analysis-top-group-data';
import { Jobs } from 'src/app/interfaces/document/jobs';
import { Urdayin } from 'src/app/interfaces/document/urdayin';
import { ConfigService } from 'src/app/services/config.service';
import { JobsService } from 'src/app/services/jobs.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { DateUtil } from 'src/app/utilities/date-util';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {

  //#region 変数

  private member: FormControl = new FormControl('');
  private startYear: FormControl = new FormControl(0);
  private startMonth: FormControl = new FormControl(0);
  private endYear: FormControl = new FormControl(0);
  private endMonth: FormControl = new FormControl(0);

  public conditionForm = new FormGroup({
    member: this.member,
    startYear: this.startYear,
    startMonth: this.startMonth,
    endYear: this.endYear,
    endMonth: this.endMonth,
  });

  public optionYear: number[] = [];
  public optionMonth: number[] = [];
  public memberData: Urdayin[] = [];

  public dataTopGroup: AnalysisTopGroupData = {
    summary: [],
    totalHours: 0
  };
  public dataLeftDaily: AnalysisLeftDailyData[] = [];
  public dataRightJobs: AnalysisRightJobsData[] = [];

  //#endregion

  //#region コンストラクタ
  constructor(
    private sConfig: ConfigService
    , private sUrdayin: UrdayinService
    , private sJobs: JobsService) {

  }
  //#endregion

  //#region ngOnInit
  /**
   * 初期設定
   */
  public ngOnInit(): void {

    // 年月の選択肢を作成
    this.createOptionValues();

    // 初期値を設定する
    this.setInitValue();

    // 監視設定
    this.setSubscribes();

    // 検索する
    this.search();
  }
  //#endregion

  //#region getCssWidth
  /**
   * CSSのWidthを取得する（単位：パーセント）
   * @param ratio 
   * @returns 
   */
  public getCssWidth(ratio: number): string {
    return String(ratio) + "%";
  }
  //#endregion

  //#region getCssBgColor
  /**
   * CSSの背景色を取得する
   * @param groupName 
   * @returns 
   */
  public getCssBgColor(groupName: string): string {
    return String(this.dataTopGroup.summary.find(x => x.groupName === groupName)?.groupColor);
  }
  //#endregion

  //#region createOptionValues
  /**
   * 選択肢を作成する
   */
  private createOptionValues() {

    // メンバー
    this.sUrdayin.getMemberData()
      .subscribe(urdayin => {
        this.memberData = urdayin;
      });

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

  //#region setInitValue
  /**
   * 初期値を設定する
   */
  private setInitValue() {
    // メンバー
    this.member.setValue(this.sUrdayin.getSelectedUser());

    // 年月
    const year: number = new Date().getFullYear();
    const month: number = new Date().getMonth() + 1;

    this.startYear.setValue(year);
    this.startMonth.setValue(month);
    this.endYear.setValue(year);
    this.endMonth.setValue(month);
  }
  //#endregion

  //#region setSubscribes
  /**
   * 監視を設定する
   */
  private setSubscribes() {
    this.member.valueChanges.subscribe(x => this.search());
    this.startYear.valueChanges.subscribe(x => this.search());
    this.startMonth.valueChanges.subscribe(x => this.search());
    this.endYear.valueChanges.subscribe(x => this.search());
    this.endMonth.valueChanges.subscribe(x => this.search());
  }
  //#endregion

  //#region 
  /**
   * 検索する
   */
  private search() {

    let isLoading: boolean = true;

    const member: string = this.member.value;
    const startYear: number = this.startYear.value;
    const startMonth: number = this.startMonth.value;
    const endYear: number = this.endYear.value;
    const endMonth: number = this.endMonth.value;

    const startYearMonth: string = DateUtil.convertNumberToYearMonthString(startYear, startMonth);
    const endYearMonth: string = DateUtil.convertNumberToYearMonthString(endYear, endMonth);

    const groupColors: string[] = [
      "#f7dbf0",
      "#f7dbdf",
      "#f7e8db",
      "#f6f7db",
      "#e5f7db",
      "#dbf7e2",
      "#dbf7f3",
      "#dbeaf7",
      "#dcdbf7",
      "#eddbf7"
    ]

    console.log("検索開始");

    this.sJobs.getDataRangeMonth(member, startYearMonth, endYearMonth)
      .subscribe(jobs => {

        // 上に表示するグループ毎のデータ用
        let dataTopGroup: AnalysisTopGroupData = {
          summary: [],
          totalHours: 0,
        }

        // 左に表示する日毎のデータ用
        let dataLeftDaily: AnalysisLeftDailyData[] = [];

        // 右に表示する作業毎のデータ用
        let dataRightJobs: AnalysisRightJobsData[] = [];

        jobs.forEach(job => {

          // 上用：総合計時間に加算
          dataTopGroup.totalHours += job.hours;

          // 上用：グループの時間に加算
          const summaryIndex: number = dataTopGroup.summary.findIndex(x => x.groupName === job.group_name);
          const maxSummaryIndex: number = dataTopGroup.summary.length;
          const groupColorIndex: number = maxSummaryIndex - 1 <= groupColors.length - 1 ? maxSummaryIndex : -1;
          if (summaryIndex === -1) {
            dataTopGroup.summary.push({
              groupName: job.group_name,
              hours: job.hours,
              ratio: 0,
              groupColor: groupColorIndex > -1 ? groupColors[groupColorIndex] : "#cbcbcb",
            })
          } else {
            dataTopGroup.summary[summaryIndex].hours += job.hours;
          }

          // 左用：日の合計時間に加算
          let dailyIndex: number = dataLeftDaily.findIndex(x => x.date === job.date);
          if (dailyIndex === -1) {
            dataLeftDaily.push({
              date: job.date,
              totalHours: job.hours,
              breakdown: [this.createBreakdown(job, false)]
            });
          } else {
            dataLeftDaily[dailyIndex].totalHours += job.hours;
          }

          // 左用：日毎の作業時間に加算
          dailyIndex = dataLeftDaily.findIndex(x => x.date === job.date);
          const breakdownIndex: number = dataLeftDaily[dailyIndex].breakdown.findIndex(x => x.groupName === job.group_name && x.job === job.job);
          if (breakdownIndex === -1) {
            dataLeftDaily[dailyIndex].breakdown.push(this.createBreakdown(job, true));
          } else {
            dataLeftDaily[dailyIndex].breakdown[breakdownIndex].hours += job.hours;
          }

          // 右用：作業毎に加算
          const jobIndex: number = dataRightJobs.findIndex(x => x.groupName === job.group_name && x.jobName === job.job);
          if (jobIndex === -1) {
            dataRightJobs.push({
              groupName: job.group_name,
              jobName: job.job,
              hours: job.hours,
            })
          } else {
            dataRightJobs[jobIndex].hours += job.hours;
          }

        });

        // 上用：割合を算出する
        dataTopGroup.summary.forEach(s => {
          s.ratio = this.calcRatio(s.hours, dataTopGroup.totalHours);
        });

        // 上用：工数多い順にソート
        dataTopGroup.summary.sort((a, b) => {
          if (a.hours < b.hours) {
            return 1;
          }
          if (a.hours > b.hours) {
            return -1;
          }

          return 0;
        });

        // 左用：割合を算出する
        dataLeftDaily.forEach(day => {
          day.breakdown.forEach(breakdown => {
            breakdown.ratio = this.calcRatio(breakdown.hours, day.totalHours);
          });
        });

        // 右用：グループ名でソート
        dataRightJobs.sort((a, b) => {
          if (a.groupName > b.groupName) {
            return 1;
          }

          if (a.groupName < b.groupName) {
            return -1;
          }
          return 0;
        });

        // 加工結果をグローバル変数に設定
        this.dataTopGroup = dataTopGroup;
        this.dataLeftDaily = dataLeftDaily;
        this.dataRightJobs = dataRightJobs;

        isLoading = false;
      });
  }
  //#endregion

  //#region calcRatio
  /**
   * 割合を算出する（小数第１位まで、切り捨て）
   * @param bunshi 比べられる量
   * @param bunbo もとにする量
   * @returns 割合（小数第１位まで、切り捨て）
   */
  private calcRatio(bunshi: number, bunbo: number): number {
    const result: number = bunshi / bunbo;
    const percent: number = result * 100;
    return Math.floor(percent * 10) / 10;
  }
  //#endregion

  //#region createBreakdown
  /**
   * 内訳データを作成する
   * @param job 工数データ
   * @param isSetHours 工数を設定するか
   * @returns 
   */
  private createBreakdown(job: Jobs, isSetHours: boolean): AnalysisBreakdown {
    return {
      groupName: job.group_name,
      job: job.job,
      hours: isSetHours ? job.hours : 0,
      ratio: 0,
    };
  }
  //#endregion

}
