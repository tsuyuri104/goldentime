import { Common } from './common';

describe('Common', () => {
  it('should create an instance', () => {
    expect(new Common()).toBeTruthy();
  });

  it('invertSortTypeを実行（ASC）', () => {
    expect(Common.invertSortType("asc")).toBe("desc");
  });

  it('invertSortTypeを実行（DESC）', () => {
    expect(Common.invertSortType("desc")).toBe("asc");
  });

  it('deleteHtmlTagを実行', () => {
    expect(Common.deleteHtmlTag('<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>Urdayin</title><base href="/"><meta name="viewport" content = "width=device-width, initial-scale=1"><link rel="icon" type = "image/x-icon" href = "favicon.ico"><link rel="manifest" href = "manifest.webmanifest"><meta name="theme-color" content = "#cdf0ea"></head><body><app-root></app-root><noscript>Please enable JavaScript to continue using this application.</noscript></body></html>'))
      .toEqual("UrdayinPlease enable JavaScript to continue using this application.");
  });

  it('cutLongTextを実行（５文字、日本語）', () => {
    expect(Common.cutLongText('寿限無寿限無五劫のすり切れ海砂利水魚の水行末雲来末風来末食う寝るところに住むところやぶら小路のぶら小路パイポパイポパイポのシューリンガンシューリンガンのグーリンダイグーリンダイのポンポコピーのポンポコナの長久命の長助', 5))
      .toEqual('寿限無寿限...');
  });

  it('cutLongTextを実行（５文字、英語）', () => {
    expect(Common.cutLongText('Tomorrow, and tomorrow, and tomorrow.Creeps in this petty pace from day to day.To the last syllable of recorded time;', 5))
      .toEqual('Tomor...');
  });
});
