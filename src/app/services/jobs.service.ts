import { Injectable } from '@angular/core';
import { addDoc, collection, collectionGroup, DocumentData, getDocs, getFirestore, orderBy, query, QuerySnapshot, where } from 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Daily } from '../interfaces/document/daily';
import { Jobs } from '../interfaces/document/jobs';
import { DateUtil } from '../utilities/date-util';
import { DailyService } from './daily.service';
import { UrdayinService } from './urdayin.service';
import { CsvRow } from '../interfaces/component/csv-row';
import { Fire } from '../utilities/fire';

@Injectable({
  providedIn: 'root'
})
export class JobsService {

  //#region 内部クラス

  public FIELD_NAME = class {
    public static readonly JOB: string = "job";
    public static readonly HOURS: string = "hours";
    public static readonly DATE: string = "date";
    public static readonly USER: string = "user";
    public static readonly INDEX: string = "index";
  }

  //#endregion

  //#region コンストラクタ
  constructor(private sUrdayin: UrdayinService, private sDaily: DailyService, private angularFire: AngularFirestore) {

  }
  //#endregion

  //#region メソッド

  //#region getData
  /**
   * 仕事データを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param date 対象の年月日
   * @returns 仕事データ
   */
  public getData(email: string, date: string): Observable<Jobs[]> {
    const path: string = Fire.combinePath([this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date, this.sDaily.SUB_COLLECTION_NAME.JOBS]);
    return this.angularFire.collection<Jobs>(path, ref => ref.orderBy(this.FIELD_NAME.INDEX, "asc")).valueChanges()
      .pipe(map(x => this.setInitValue(x)));
  }
  //#endregion

  //#region getDataForCsv
  /**
   * CSV出力用のデータを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param yearmonth 対象の年月
   * @returns 出力対象のデータ
   */
  public getDataForCsv(email: string, yearmonth: string): Observable<string[][]> {
    //１ヶ月分のデータを取得する
    return this.getDataOneMonth(email, yearmonth)
      .pipe(
        map(jobDocs => {
          // CSVに書き込む内容
          let contents: CsvRow[] = [];
          let header: CsvRow = {
            group_name: "集約グループ",
            job_name: "作業内容",
            daily_hours: new Map(),
          }

          //月の一日を取得する
          const firstDate: Date = DateUtil.getFirstDateFromYearMonth(yearmonth);

          //月の最終日を取得する
          const lastDate: Date = DateUtil.getLastDateFromYearMonth(yearmonth);

          // 月間日数を取得する
          const daysInMonth: number = lastDate.getDate();

          // 日数分キーを作成してテンプレートとする
          const templateDailyHours: Map<string, number> = new Map();
          for (let i = 0; i < daysInMonth; i++) {
            //日付を取得する
            const tmpDate: Date = DateUtil.addDate(firstDate, i);
            const strTmpDate: string = DateUtil.toString(tmpDate);

            // テンプレートにキーを用意する
            templateDailyHours.set(strTmpDate, 0);

            // ヘッダーに日付を設定する
            header.daily_hours.set(strTmpDate, 0);
          }

          // CSVに書き込む内容をデータ単位で処理する
          jobDocs.forEach(doc => {

            let targetIndex: number = contents.findIndex(x => x.group_name === doc.group_name && x.job_name === doc.job);
            let target: CsvRow = {
              group_name: doc.group_name,
              job_name: doc.job,
              daily_hours: new Map(templateDailyHours),
            }

            // 存在する場合は取得する
            if (targetIndex > -1) {
              target = contents[targetIndex];
            }

            // 加算
            target.daily_hours.set(doc.date, target.daily_hours.get(doc.date)! + doc.hours);

            // 存在しない場合は追加する
            if (targetIndex === -1) {
              contents.push(target);
            }
          });

          //集約グループ単位でソートする
          contents.sort(function (a, b) {
            //集約グループ名
            if (a.group_name < b.group_name) {
              return -1;
            }
            if (a.group_name > b.group_name) {
              return 1;
            }

            //作業内容
            if (a.job_name < b.job_name) {
              return -1;
            }

            if (a.job_name > b.job_name) {
              return 1;
            }

            return 0;
          });

          //日付のヘッダー行を追加する
          contents.unshift(header);

          // CSV書き込む形の文字列の配列に変換する
          return this.convertStringArrayForCsv(contents, firstDate, daysInMonth);
        })
      );
  }
  //#endregion

  //#region getDataOneMonth
  /**
   * １ヶ月分の仕事データを取得する
   * @param email 対象のユーザーのメールアドレス
   * @param yearmonth 対象の年月
   * @returns 対象のデータ
   */
  public getDataOneMonth(email: string, yearmonth: string): Observable<Jobs[]> {
    return this.getDataRangeMonth(email, yearmonth, yearmonth);
  }
  //#endregion

  public getDataRangeMonth(email: string, startYearMonth: string, endYearMonth: string): Observable<Jobs[]> {
    return this.angularFire.collectionGroup<Jobs>(this.sDaily.SUB_COLLECTION_NAME.JOBS,
      ref => ref.where(this.FIELD_NAME.USER, "==", email)
        .where(this.FIELD_NAME.DATE, ">=", startYearMonth + "01")
        .where(this.FIELD_NAME.DATE, "<=", endYearMonth + "31")
        .orderBy(this.FIELD_NAME.DATE, "asc")
        .orderBy(this.FIELD_NAME.INDEX, "asc")
    ).valueChanges();
  }

  //#region insertJobData
  /**
   * 仕事データを登録する
   * @param inputData 
   * @param email 
   * @param date 
   */
  public insertJobData(inputData: Daily, email: string, date: string): void {
    const db = getFirestore();

    //仕事データ整形
    const jobs: Jobs[] = <Jobs[]>inputData.jobs;

    let index: number = 0;
    jobs.forEach(job => {

      //空の仕事データは処理スキップ
      if (this.isEmptyJobData(job)) {
        return;
      }

      //仕事データ整形
      job.user = email;
      job.date = date;
      job.index = index;
      index++;

      //仕事データを更新する
      const ref2 = collection(db, this.sUrdayin.COLLECTION_NAME, email, this.sUrdayin.SUB_COLLECTION_NAME.DAILY, date, this.sDaily.SUB_COLLECTION_NAME.JOBS);
      addDoc(ref2, job);
    });
  }
  //#endregion

  //#region isEmptyJobData
  /**
   * 空の仕事データか判定する
   * @param job 
   * @returns 
   */
  private isEmptyJobData(job: Jobs): boolean {
    //稼働０と仕事内容空白は空データと判定する
    if (job.hours === 0 && job.job === "") {
      return true;
    }
    return false;
  }
  //#endregion

  //#region convertStringArrayForCsv
  /**
   * CSV型から文字列配列に変換する
   * @param contents CSV型
   * @param firstDate 月の最初の日
   * @param daysInMonth 月間の日数
   * @returns CSV出力用文字列
   */
  private convertStringArrayForCsv(contents: CsvRow[], firstDate: Date, daysInMonth: number): string[][] {
    let csvData: string[][] = [];
    let isHeader: boolean = true;

    contents.forEach(row => {
      let line: string[] = [];
      line.push(row.group_name);
      line.push(row.job_name);

      for (let i = 0; i < daysInMonth; i++) {
        //日付を取得する
        const tmpDate: Date = DateUtil.addDate(firstDate, i);
        const strTmpDate: string = DateUtil.toString(tmpDate);

        if (isHeader) {
          line.push(strTmpDate);
        } else {
          line.push(String(row.daily_hours.get(strTmpDate)));
        }
      }
      isHeader = false;

      csvData.push(line);
    });

    return csvData;
  }
  //#endregion

  //#region setInitValue
  /**
   * 仕事データの初期値を設定する
   * @param data 
   * @returns 
   */
  private setInitValue(data: Jobs[]): Jobs[] {
    if (data.length === 0) {
      data.push({
        job: "",
        hours: 0,
        user: "",
        date: "",
        group_name: "",
      });
    }
    return data;
  }
  //#endregion

  //#endregion
}
