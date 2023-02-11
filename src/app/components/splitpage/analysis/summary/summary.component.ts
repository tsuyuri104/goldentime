import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AnalysisLeftDailyData } from 'src/app/interfaces/component/analysis-left-daily-data';
import { AnalysisRightJobsData } from 'src/app/interfaces/component/analysis-right-jobs-data';
import { AnalysisSummary } from 'src/app/interfaces/component/analysis-summary';
import { AnalysisTopGroupData } from 'src/app/interfaces/component/analysis-top-group-data';
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
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

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

  constructor(
    private sConfig: ConfigService
    , private sUrdayin: UrdayinService
    , private sJobs: JobsService
    , private sFile: FileService
    , private sCsv: CSVService
    , private sHoliday: HolidayService) { }

  ngOnInit(): void {
    console.log("概要初期");
  }


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

    // 0.5刻みにならない場合
    if (totalHours % 0.5 > 0) {
      // 0.5刻みで切り上げる
      totalHours = Math.ceil(Math.ceil(totalHours * 10) / 10);
    }

    // 30分1枠
    const endLine: number = (totalHours * 2) + 2;
    return result + String(endLine);
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
}
