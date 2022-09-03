import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormControlName } from '@angular/forms';
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

    console.log("検索開始");

    this.sJobs.getDataRangeMonth(member, startYearMonth, endYearMonth)
      .subscribe(jobs => {


        isLoading = false;
      });
  }
  //#endregion

}
