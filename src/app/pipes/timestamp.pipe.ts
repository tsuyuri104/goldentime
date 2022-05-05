import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { DateUtil } from '../utilities/date-util';

@Pipe({
  name: 'timestamp'
})
export class TimestampPipe implements PipeTransform {

  constructor() { }

  transform(value: Timestamp | undefined | null, format: string = ""): string {

    //値が設定されていない場合は、空文字を返す
    if (value === undefined || value == null) {
      return "";
    }

    //フォーマットに整形する
    return DateUtil.toStringFormat(value.toDate(), format);
  }

}
