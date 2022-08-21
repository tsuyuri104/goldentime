import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CSVService {

  //#region コンストラクタ
  constructor() {

  }
  //#endregion

  //#region メソッド

  //#region convertStringCsvLine
  /**
   * 配列からCSVの１行の文字列に変換する
   * @param contents １行分の内容の配列
   * @param colsLength 列の数
   * @param initValue 配列に値がない場合の初期値
   * @returns CSVとしての１行の文字列
   */
  public convertStringCsvLine(contents: string[], colsLength: number, initValue: string): string {

    //１行の文字列
    let line: string = "";

    //列数分処理する
    for (let i = 0; i < colsLength; i++) {

      //２列目以降にカンマを追加する
      if (i > 0) {
        line += ",";
      }

      if (contents[i]) {
        //配列に要素がある場合は、配列の要素を追加する
        line += '"' + contents[i] + '"';
      } else {
        //配列に要素がない場合は、初期値を追加する
        line += '"' + initValue + '"';
      }
    }

    //改行コードを追加する
    line += "\n";

    return line;
  }
  //#endregion

  //#endregion
}
