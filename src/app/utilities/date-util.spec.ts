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

  it('isSundayを実行(true))', () => {
    //2022/09/04
    expect(DateUtil.isSunday(new Date(2022, 8, 4))).toBeTrue();
  });

  it('isSundayを実行(false))', () => {
    //2022/09/05
    expect(DateUtil.isSunday(new Date(2022, 8, 5))).toBeFalse();
  });

  it('isSaturdayを実行(true)', () => {
    //2022/09/03
    expect(DateUtil.isSaturday(new Date(2022, 8, 3))).toBeTrue();
  });

  it('isSaturdayを実行(false)', () => {
    //2022/09/4
    expect(DateUtil.isSaturday(new Date(2022, 8, 4))).toBeFalse();
  });

  it('convertNumberToYearMonthStringを実行（月が1桁）', () => {
    expect(DateUtil.convertNumberToYearMonthString(2022, 1)).toBe("202201");
  });

  it('convertNumberToYearMonthStringを実行（月が2桁）', () => {
    expect(DateUtil.convertNumberToYearMonthString(2022, 11)).toBe("202211");
  });

  it('getGapDaysを実行', () => {
    expect(DateUtil.getGapDays("202201", "202202")).toBe(59);
  });
});
