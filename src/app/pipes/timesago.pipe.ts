import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

@Pipe({
  name: 'timesago'
})
export class TimesagoPipe implements PipeTransform {

  transform(tsValue: Timestamp): string {
    const now: Date = new Date();
    const dValue: Date = tsValue.toDate();

    // 差分算出
    const diff = new Date(now.getTime() - dValue.getTime());

    // 文字に変換する
    return this.transferAgoText(diff);
  }

  //#region transferAgoText
  /**
   * N分前などの文字に変換する
   * @param diff 
   * @returns 
   */
  private transferAgoText(diff: Date): string {

    const diffYears: number = diff.getUTCFullYear() - 1970;
    const diffMonths: number = diff.getUTCMonth();
    const diffDays: number = diff.getUTCDate() - 1;
    const diffHours: number = diff.getUTCHours();
    const diffMinutes: number = diff.getUTCMinutes();
    const diffSeconds: number = diff.getUTCSeconds();

    if (diffYears > 0) {
      return diffYears + "年" + diffMonths + "か月前";
    }

    if (diffMonths > 0) {
      return diffMonths + "か月" + diffDays + "前";
    }

    if (diffDays > 0) {
      return diffDays + "日" + diffHours + "時間前";
    }

    if (diffHours > 0) {
      return diffHours + "時間" + diffMinutes + "分前";
    }

    if (diffMinutes > 0) {
      return diffMinutes + "分前";
    }

    if (diffSeconds > 0) {
      return diffSeconds + "秒前";
    }

    //一秒前以前
    return "さっき";
  }
  //#endregion

}
