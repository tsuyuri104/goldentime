import { DecimalPipe } from '@angular/common';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormControlName } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { AnalysisBreakdown } from 'src/app/interfaces/component/analysis-breakdown';
import { AnalysisLeftDailyData } from 'src/app/interfaces/component/analysis-left-daily-data';
import { AnalysisRightJobsData } from 'src/app/interfaces/component/analysis-right-jobs-data';
import { AnalysisSummary } from 'src/app/interfaces/component/analysis-summary';
import { AnalysisTopGroupData } from 'src/app/interfaces/component/analysis-top-group-data';
import { Jobs } from 'src/app/interfaces/document/jobs';
import { Urdayin } from 'src/app/interfaces/document/urdayin';
import { ConfigService } from 'src/app/services/config.service';
import { CSVService } from 'src/app/services/csv.service';
import { FileService } from 'src/app/services/file.service';
import { HolidayService } from 'src/app/services/holiday.service';
import { JobsService } from 'src/app/services/jobs.service';
import { UrdayinService } from 'src/app/services/urdayin.service';
import { Encode } from 'src/app/types/encode';
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

  private csvSubscription: Subscription = new Subscription();

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

  public topInfo: string = "";

  //#endregion

  //#region コンストラクタ
  constructor(
    private sConfig: ConfigService
    , private sUrdayin: UrdayinService
    , private sJobs: JobsService
    , private sFile: FileService
    , private sCsv: CSVService
    , private sHoliday: HolidayService) {

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

  //#region ngOnDestroy
  /**
   * 破棄設定
   */
  public ngOnDestroy(): void {
    this.csvSubscription.unsubscribe();
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

  //#region getCssGridColmn
  /**
   * CSSのグリッドの列数を取得する
   * @param totalHours 
   * @returns 
   */
  public getCssGridColmn(totalHours: number): string {
    let result: string = "2/";
    const endLine: number = Math.ceil(totalHours) + 2;
    return result + String(endLine);
  }
  //#endregion

  //#region exportCsv
  /**
   * CSV出力処理
   * @param encode 
   */
  public async exportCsv(encode: Encode): Promise<void> {

    const member: string = this.member.value;
    const startYear: number = this.startYear.value;
    const startMonth: number = this.startMonth.value;
    const endYear: number = this.endYear.value;
    const endMonth: number = this.endMonth.value;

    const startYearMonth: string = DateUtil.convertNumberToYearMonthString(startYear, startMonth);
    const endYearMonth: string = DateUtil.convertNumberToYearMonthString(endYear, endMonth);


    //出力対象のデータを取得する
    this.csvSubscription = this.sJobs.getDataForCsv(member, startYearMonth, endYearMonth).subscribe(contents => {

      const daysInMonth: number = DateUtil.getGapDays(startYearMonth, endYearMonth);

      //CSVフォーマットとして文字連結する
      const colsLength: number = daysInMonth + 2;
      let strCsvValue: string = "";
      contents.forEach(content => {
        strCsvValue += this.sCsv.convertStringCsvLine(content, colsLength, "0");
      });

      //出力する
      this.sFile.download(strCsvValue, "工数一覧_" + startYearMonth + "_" + endYearMonth, "text/csv", encode);
    });
  }
  //#endregion

  //#region setTopInfo
  /**
   * 上部の情報を設定する
   * @param summary 
   */
  public setTopInfo(summary: AnalysisSummary): void {
    const pipe: DecimalPipe = new DecimalPipe('en-US');
    this.topInfo = summary.groupName + " : " + pipe.transform(summary.hours, "1.1-1");
  }
  //#endregion

  //#region clearTopInfo
  /**
   * 上部の情報をクリアする
   */
  public clearTopInfo(): void {
    this.topInfo = "";
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

  //#region search
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
          if (summaryIndex === -1) {
            dataTopGroup.summary.push({
              groupName: job.group_name,
              hours: job.hours,
              ratio: 0,
              groupColor: "#cbcbcb",
            })
          } else {
            dataTopGroup.summary[summaryIndex].hours += job.hours;
          }

          // 左用：日の合計時間に加算
          const jobDate: Date = DateUtil.toDate(job.date);
          let dailyIndex: number = dataLeftDaily.findIndex(x => DateUtil.toString(x.date) === job.date);
          if (dailyIndex === -1) {
            dataLeftDaily.push({
              date: jobDate,
              totalHours: job.hours,
              breakdown: [this.createBreakdown(job, false)],
              isSaturday: DateUtil.isSaturday(jobDate),
              isSunday: DateUtil.isSunday(jobDate),
              isHoliday: false,
            });
          } else {
            dataLeftDaily[dailyIndex].totalHours += job.hours;
          }

          // 左用：日毎の作業時間に加算
          dailyIndex = dataLeftDaily.findIndex(x => DateUtil.toString(x.date) === job.date);
          const breakdownIndex: number = dataLeftDaily[dailyIndex].breakdown.findIndex(x => x.groupName === job.group_name);
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

        // 加工結果をグローバル変数に設定
        this.dataTopGroup = this.processTopData(dataTopGroup);
        this.dataLeftDaily = this.processLeftData(dataLeftDaily, startYearMonth, endYearMonth);
        this.dataRightJobs = this.processRightData(dataRightJobs);

        // 祝日設定
        this.sHoliday.getHolidayData(startYearMonth, endYearMonth).subscribe(holidays => {
          console.log("get holidays")
          this, this.dataLeftDaily.forEach(d => {
            if (holidays.find(x => x.date === DateUtil.toString(d.date))) {
              d.isHoliday = true;
            }
          });
        });

        console.log("end serch");
        isLoading = false;
      });
  }
  //#endregion

  //#region processTopData
  /**
   * 上部用のデータを加工する
   * @param dataTopGroup 
   * @returns 
   */
  private processTopData(dataTopGroup: AnalysisTopGroupData): AnalysisTopGroupData {
    // 割合を算出する
    dataTopGroup.summary.forEach(s => {
      s.ratio = this.calcRatio(s.hours, dataTopGroup.totalHours);
    });

    // 工数多い順にソート
    this.sortHours(dataTopGroup.summary);

    const groupColors: string[] = [
      "#f7dbf0",
      "#f7e8db",
      "#fbd6d9",
      "#f6f7db",
      "#e5f7db",
      "#dbf7f3",
      "#dbeaf7",
      "#dcdbf7",
      "#eddbf7",
      "#dee6ed",
    ];

    // 背景色を設定する
    dataTopGroup.summary.forEach((s, index) => {
      if (index <= groupColors.length - 1) {
        s.groupColor = groupColors[index];
      }
    });

    return dataTopGroup;
  }
  //#endregion

  //#region processLeftData
  /**
   * 左用のデータを加工する
   * @param dataLeftDaily 
   * @param startYearMonth 
   * @param endYearMonth 
   * @returns 
   */
  private processLeftData(dataLeftDaily: AnalysisLeftDailyData[], startYearMonth: string, endYearMonth: string): AnalysisLeftDailyData[] {
    //月の一日を取得する
    const firstDate: Date = DateUtil.getFirstDateFromYearMonth(startYearMonth);

    //月の最終日を取得する
    const lastDate: Date = DateUtil.getLastDateFromYearMonth(endYearMonth);
    let i: number = 0;
    let tmpDate: Date = firstDate;
    // データにない日の枠を作成する
    while (tmpDate <= lastDate) {
      const index: number = dataLeftDaily.findIndex(x => DateUtil.toString(x.date) === DateUtil.toString(tmpDate));
      if (index === -1) {
        dataLeftDaily.push({
          date: tmpDate,
          totalHours: 0,
          breakdown: [],
          isSaturday: DateUtil.isSaturday(tmpDate),
          isSunday: DateUtil.isSunday(tmpDate),
          isHoliday: false,
        })
      }
      tmpDate = DateUtil.addDate(firstDate, i);
      i++;
    }

    // 日付順にソート
    dataLeftDaily.sort((a, b) => {
      if (a.date > b.date) {
        return 1;
      }

      if (a.date < b.date) {
        return -1;
      }
      return 0;
    });

    dataLeftDaily.forEach(day => {
      // 割合を算出する
      day.breakdown.forEach(breakdown => {
        breakdown.ratio = this.calcRatio(breakdown.hours, day.totalHours);
      });

      // 工数多い順にソート
      this.sortHours(day.breakdown);
    });

    return dataLeftDaily;
  }
  //#endregion

  //#region processRightData
  /**
   * 右用のデータを加工する
   * @param dataRightJobs 
   * @returns 
   */
  private processRightData(dataRightJobs: AnalysisRightJobsData[]): AnalysisRightJobsData[] {
    // グループ名でソート
    dataRightJobs.sort((a, b) => {
      if (a.groupName > b.groupName) {
        return 1;
      }

      if (a.groupName < b.groupName) {
        return -1;
      }
      return 0;
    });
    return dataRightJobs;
  }
  //#endregion

  //#region sortHours
  /**
   * 工数でソートする
   * @param value 
   * @returns 
   */
  private sortHours(value: AnalysisSummary[] | AnalysisBreakdown[]): AnalysisSummary[] | AnalysisBreakdown[] {
    return value.sort((a, b) => {
      if (a.hours < b.hours) {
        return 1;
      }
      if (a.hours > b.hours) {
        return -1;
      }

      return 0;
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
      hours: isSetHours ? job.hours : 0,
      ratio: 0,
    };
  }
  //#endregion

}
