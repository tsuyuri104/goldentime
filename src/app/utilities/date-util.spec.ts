import { DateUtil } from './date-util';

describe('DateUtil', () => {
  it('should create an instance', () => {
    expect(new DateUtil()).toBeTruthy();
  });

  //2022年6月1日
  const valueA: Date = new Date(2022, 5, 1);
  const valueB: string = "20220601";

  //2022年５月16日
  const valueC: Date = new Date(2022, 4, 16);

  it('toStringを実行', () => {
    expect(DateUtil.toString(valueA)).toBe(valueB);
  });

  it('toStringYearMonthを実行', () => {
    expect(DateUtil.toStringYearMonth(valueA)).toBe('202206');
  });

  it('toDateを実行', () => {
    expect(DateUtil.toDate(valueB)).toEqual(valueA);
  });

  it('addDateを実行（翌日）', () => {
    const value: Date = new Date(2022, 5, 2);
    expect(DateUtil.addDate(valueA, 1)).toEqual(value);
  });

  it('addDateを実行（前日）', () => {
    const value: Date = new Date(2022, 4, 31);
    expect(DateUtil.addDate(valueA, -1)).toEqual(value);
  });

  it('getFirstDateを実行', () => {
    const value: Date = new Date(2022, 4, 1);
    expect(DateUtil.getFirstDate(valueC)).toEqual(value);
  });

  it('getLastDateを実行', () => {
    const value: Date = new Date(2022, 4, 31);
    expect(DateUtil.getLastDate(valueC)).toEqual(value);
  });

  it('getFirstDateFromYearMonthを実行', () => {
    expect(DateUtil.getFirstDateFromYearMonth(valueB)).toEqual(valueA);
  });

  it('toStringFormatを実行（yyyy年MM月dd日）', () => {
    expect(DateUtil.toStringFormat(valueA, 'yyyy年MM月dd日')).toBe('2022年06月01日');
  });

  it('toStringFormatを実行（yyyy/MM/dd）', () => {
    expect(DateUtil.toStringFormat(valueA, 'yyyy/MM/dd')).toBe('2022/06/01');
  });
});
