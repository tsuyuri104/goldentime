import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Common } from '../utilities/common';

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
    return Common.dateToStringFormat(value.toDate(), format);
  }

}
