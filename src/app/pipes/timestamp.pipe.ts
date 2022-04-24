import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Common } from '../utilities/common';

@Pipe({
  name: 'timestamp'
})
export class TimestampPipe implements PipeTransform {

  constructor() { }

  transform(value: Timestamp, format: string = ""): string | null {
    return Common.dateToStringFormat(value.toDate(), format);
  }

}
