import { HolidayService } from "src/app/services/holiday.service";
import { DateUtil } from "src/app/utilities/date-util";

export class DateInfo {
    date: Date;
    isHoliday: boolean;
    isSunday: boolean;
    isSaturday: boolean;

    //#region コンストラクタ
    constructor(private sHoliday: HolidayService) {
        // 初期値設定
        this.date = new Date();
        this.isHoliday = false;
        this.isSunday = false;
        this.isSaturday = false;
    }
    //#endregion

    //#region Set
    /**
     * 値を設定する
     * @param date 
     */
    public async Set(date: Date): Promise<void> {
        this.date = date;
        this.isHoliday = await this.sHoliday.isHoliday(date);
        this.isSunday = DateUtil.isSunday(date);
        this.isSaturday = DateUtil.isSaturday(date);
    }
    //#endregion
}