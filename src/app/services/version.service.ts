import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  //#region 変数

  public readonly version: string = "2.1.2";

  //#endregion

  //#region コンストラクタ
  constructor() {

  }
  //#endregion
}
