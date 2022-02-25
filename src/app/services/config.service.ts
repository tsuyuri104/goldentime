import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  //#region 変数

  public readonly appName: string = "urdayin";
  public readonly version: string = "2.2.2";

  //#endregion

  //#region コンストラクタ
  constructor() {

  }
  //#endregion
}
