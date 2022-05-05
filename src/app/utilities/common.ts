import { SortType } from "../types/sort-type";

export class Common {

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

    //#region deleteHtmlTag
    /**
     * HTMLのタグを除去する
     * @param text 
     * @returns 
     */
    public static deleteHtmlTag(text: string): string {
        return text.replace(/<(?:.|\n)*?>/gm, '');
    }
    //#endregion

    //#region cutLongText
    /**
     * 長い文章を切り取る
     * @param text 
     * @param size 
     * @returns 
     */
    public static cutLongText(text: string, size: number): string {
        let suffix: string = "";
        if (text.length > size) {
            suffix = "...";
        }
        return text.substring(0, size) + suffix;
    }
    //#endregion
}
