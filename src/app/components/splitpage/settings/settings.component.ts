import { Component, OnInit } from '@angular/core';
import { GroupNameKeyValue } from 'src/app/interfaces/document/group-name-key-value';
import { GroupNameService } from 'src/app/services/group-name.service';
import { UrdayinService } from 'src/app/services/urdayin.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  //#region 変数

  public groupData: GroupNameKeyValue = {};

  //#endregion

  //#region コンストラクタ
  constructor(
    private sGroupName: GroupNameService
    , private sUrdayin: UrdayinService) {

  }
  //#endregion

  //#region イベント

  //#region ngOnInit
  /**
   * 初期設定
   */
  public async ngOnInit(): Promise<void> {
    this.getGroupData();
  }
  //#endregion

  //#endregion

  //#region メソッド

  //#region deleteGroupName
  /**
   * 集約グループを削除する
   * @param docKey 
   */
  public deleteGroupName(docKey: string): void {
    this.sGroupName.deleteDoc(this.sUrdayin.getSelectedUser(), docKey);
    this.getGroupData();
  }
  //#endregion

  //#region isEmptyGroupData
  /**
   * 集約グループが空か判定する
   * @returns 
   */
  public isEmptyGroupData(): boolean {
    return !Object.keys(this.groupData).length;
  }
  //#endregion

  //#region getGroupData
  /**
   * 集約グループを取得する
   */
  private async getGroupData(): Promise<void> {
    this.groupData = await this.sGroupName.getDataKeyValue(this.sUrdayin.getSelectedUser());
  }
  //#endregion

  //#endregion

}
