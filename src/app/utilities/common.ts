import { DatePipe } from "@angular/common"

export class Common {

    //#region dateToString
    /**
     * 日付型を文字列に変換する
     * @param date 
     * @returns 文字列yyyyMMdd
     */
    public static dateToString(date: Date): string {
        return this.dateToStringFormat(date, 'yyyyMMdd');
    }
    //#endregion

    //#region dateToStringYearMonth
    /**
     * 日付を文字列に変換する（年月用）
     * @param date 
     * @returns 文字列yyyyMM
     */
    public static dateToStringYearMonth(date: Date): string {
        return this.dateToStringFormat(date, 'yyyyMM');
    }
    //#endregion

    //#region dateToStringFormat
    /**
     * 日付を指定のフォーマットで文字列に変換する
     * @param date 
     * @param format 
     * @returns 
     */
    private static dateToStringFormat(date: Date, format: string): string {
        const datepipe: DatePipe = new DatePipe('en-US');
        let formatted: string | null = datepipe.transform(date, format);
        return formatted == null ? "" : formatted;
    }
    //#endregion
}
