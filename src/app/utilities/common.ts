import { DatePipe } from "@angular/common"
import { SortType } from "../types/sort-type";

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

    //#region stringToDate
    /**
     * 文字列から日付型に変換する
     * @param strDate 文字列yyyyMMdd
     * @returns 日付型
     */
    public static stringToDate(strDate: string): Date {
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

    //#region invertSortType
    /**
     * ソート種類を反転させる
     * @param origin 
     * @returns 
     */
    public static invertSortType(origin: SortType): SortType {
        if (origin === "asc") {
            return "desc";
        } else {
            return "asc";
        }
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

    //#region splitYearMonth
    /**
     * 文字列の年月から、数値の年と月に分割する
     * @param yearmonth 
     * @returns 
     */
    private static splitYearMonth(yearmonth: string) {
        const year: number = <number><unknown>yearmonth.substring(0, 4);
        const month: number = <number><unknown>yearmonth.substring(4, 6) - 1;

        return {
            year: year,
            month: month,
        }
    }
    //#endregion
}
