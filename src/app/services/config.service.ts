import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  //#region 変数

  public readonly appName: string = "urdayin";
  public readonly version: string = "2.2.6";

  public readonly registerStartYear: number = 2022;

  public readonly contactFormUrl: string = "";

  //#endregion

  //#region コンストラクタ
  constructor() {

  }
  //#endregion
}
