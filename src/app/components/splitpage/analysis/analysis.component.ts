import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormControlName } from '@angular/forms';
import { Urdayin } from 'src/app/interfaces/document/urdayin';
import { ConfigService } from 'src/app/services/config.service';
import { UrdayinService } from 'src/app/services/urdayin.service';

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
    , private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region ngOnInit
  /**
   * 初期設定
   */
  public ngOnInit(): void {

    // 年月の選択肢を作成
    this.createOptionValues();

    // 監視設定
    this.setSubscribes();
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

  //#region setSubscribes
  /**
   * 監視を設定する
   */
  private setSubscribes() {
    this.member.valueChanges.subscribe(x => console.log(x));
    this.startYear.valueChanges.subscribe(x => console.log(x));
    this.startMonth.valueChanges.subscribe(x => console.log(x));
    this.endYear.valueChanges.subscribe(x => console.log(x));
    this.endMonth.valueChanges.subscribe(x => console.log(x));
  }
  //#endregion

}
