import { DatePipe } from "@angular/common";

export class DateUtil {

    //#region toString
    /**
     * 日付型を文字列に変換する
     * @param date 
     * @returns 文字列yyyyMMdd
     */
    public static toString(date: Date): string {
        return this.toStringFormat(date, 'yyyyMMdd');
    }
    //#endregion

    //#region toStringYearMonth
    /**
     * 日付を文字列に変換する（年月用）
     * @param date 
     * @returns 文字列yyyyMM
     */
    public static toStringYearMonth(date: Date): string {
        return this.toStringFormat(date, 'yyyyMM');
    }
    //#endregion

    //#region toDate
    /**
     * 文字列から日付型に変換する
     * @param strDate 文字列yyyyMMdd
     * @returns 日付型
     */
    public static toDate(strDate: string): Date {
        const y: number = Number(strDate.substring(0, 4));
        const m: number = Number(strDate.substring(4, 6)) - 1;
        const d: number = Number(strDate.substring(6, 8));
        return new Date(y, m, d);
    }
    //#endregion

    //#region addDate
    /**
     * 日付を加算する
     * @param date 元になる日付
     * @param addDays 加算日数
     * @returns 加算した日付
     */
    public static addDate(date: Date, addDays: number): Date {
        var date = new Date(date.valueOf());
        date.setDate(date.getDate() + addDays);
        return date;
    }
    //#endregion

    //#region getFirstDate
    /**
     * 月の初日を取得する
     * @returns 月の初日
     */
    public static getFirstDate(selectedDate: Date): Date {
        let year: number = selectedDate.getFullYear();
        let month: number = selectedDate.getMonth();

        return new Date(year, month, 1);
    }
    //#endregion

    //#region getLastDate
    /**
     * 月の最終日を取得する
     * @returns 月の最終日
     */
    public static getLastDate(selectedDate: Date): Date {
        let year: number = selectedDate.getFullYear();
        let month: number = selectedDate.getMonth() + 1;

        return new Date(year, month, 0);
    }
    //#endregion

    //#region getFirstDateFromYearMonth
    /**
     * 年月から月の初日を取得する
     * @param strYearmonth 
     * @returns 
     */
    public static getFirstDateFromYearMonth(strYearmonth: string): Date {
        const objYearmonth = this.splitYearMonth(strYearmonth);

        return this.getFirstDate(new Date(objYearmonth.year, objYearmonth.month, 1));
    }
    //#endregion

    //#region getLastDateFromYearMonth
    /**
     * 年月から月の最終日を取得する
     * @param strYearmonth 
     * @returns 
     */
    public static getLastDateFromYearMonth(strYearmonth: string): Date {
        const objYearmonth = this.splitYearMonth(strYearmonth);

        return this.getLastDate(new Date(objYearmonth.year, objYearmonth.month, 1));
    }
    //#endregion

    //#region toStringFormat
    /**
     * 日付を指定のフォーマットで文字列に変換する
     * @param date 
     * @param format 
     * @returns 
     */
    public static toStringFormat(date: Date, format: string): string {
        const datepipe: DatePipe = new DatePipe('en-US');
        let formatted: string | null = datepipe.transform(date, format);
        return formatted == null ? "" : formatted;
    }
    //#endregion

    //#region splitYearMonth
    /**
     * 文字列の年月から、数値の年と月に分割する
     * @param yearmonth 
     * @returns 
     */
    private static splitYearMonth(yearmonth: string): { year: number, month: number } {
        const year: number = <number><unknown>yearmonth.substring(0, 4);
        const month: number = <number><unknown>yearmonth.substring(4, 6) - 1;

        return {
            year: year,
            month: month,
        }
    }
    //#endregion
}
