import { DatePipe } from "@angular/common"

export class Common {

    //#region dateToStrig
    /**
     * 日付型を文字列に変換する
     * @param date 
     * @returns 文字列yyyyMMdd
     */
    public static dateToStrig(date: Date): string {
        const datepipe: DatePipe = new DatePipe('en-US');
        let formatted: string | null = datepipe.transform(date, 'yyyyMMdd');
        return formatted == null ? "" : formatted;
    }
    //#endregion
}
