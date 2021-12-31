import { DatePipe } from "@angular/common"

export class Common {

    public static dateToStrig(date: Date): string {
        const datepipe: DatePipe = new DatePipe('en-US');
        let formatted: string | null = datepipe.transform(date, 'yyyyMMdd');
        return formatted == null ? "" : formatted;
    }
}
