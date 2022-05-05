import { Injectable } from '@angular/core';
import * as encoding from 'encoding-japanese';

@Injectable({
  providedIn: 'root'
})
export class EncodingService {

  //#region コンストラクタ
  constructor() {

  }
  //#endregion

  //#region convertSjisStringFromUnicode
  /**
   * UNICODEからSJISの文字列に変換する
   * @param value 
   * @returns 
   */
  public convertSjisStringFromUnicode(value: string): string {
    const unicodeArray = encoding.stringToCode(value);
    const sjisArray = encoding.convert(unicodeArray, "SJIS", "UNICODE");
    return encoding.codeToString(sjisArray);
  }
  //#endregion

  //#region convertUnit8ArrayFromUnicode
  /**
   * UNICODEからUNIT8配列に変換する（SJIS経由）
   * @param value 
   * @returns 
   */
  public convertUnit8ArrayFromUnicode(value: string): Uint8Array {
    const unicodeArray = encoding.stringToCode(value);
    const sjisArray = encoding.convert(unicodeArray, "SJIS", "UNICODE");
    return new Uint8Array(sjisArray);
  }
  //#endregion

}
