import { Timestamp } from 'firebase/firestore';
import { TimestampPipe } from './timestamp.pipe';

describe('TimestampPipe', () => {
  const pipe = new TimestampPipe();

  const format: string = "yyyy.MM.dd HH:mm:ss";

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('タイムスタンプの場合', () => {
    //2022年7月1日14時56分32秒
    const dtValue: Date = new Date(2022, 6, 1, 14, 56, 32);
    const tsValue: Timestamp = Timestamp.fromDate(dtValue);
    expect(pipe.transform(tsValue, format)).toEqual('2022.07.01 14:56:32');
  });

  it('undefinedの場合', () => {
    expect(pipe.transform(undefined, format)).toEqual('');
  });

  it('nullの場合', () => {
    expect(pipe.transform(null, format)).toEqual('');
  });
});
