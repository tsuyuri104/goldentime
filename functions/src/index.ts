import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { Daily } from "./daily";
import { Jobs } from "./jobs";
admin.initializeApp(functions.config().firebase)

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


/**
 * 日次データを登録する
 */
export const SetDailyData = functions.https.onCall(async (data, context) => {
    //onCallなのでPOSTでくる
    try {

        console.log("------------------START------------------");

        // 送られてきたデータの検証
        const errorMessage: string = isValidData(data.data);
        if (errorMessage !== "") {

            throw new functions.https.HttpsError('invalid-argument', errorMessage);
        }

        // メアドとキーの検証
        if (! await isValidUserKey(data.data.email, data.data.key)) {
            throw new functions.https.HttpsError('unauthenticated', 'メールアドレスまたはAPIキーに誤りがあります。');
        }

        // 値に問題ないので処理しやすい形に変換する
        const daily: Daily[] = convertDailyData(data.data);

        // 登録処理
        if (! await insertData(daily, data.data.email)) {
            throw new functions.https.HttpsError('unknown', "登録処理に失敗しました。");
        }

        // 成功を返す
        return {
            result: "成功しました。",
        }
    }
    catch (error: any) {
        console.log("------------------CATCH------------------");
        console.log(error);
        throw new functions.https.HttpsError('unknown', error.message, error);
    } finally {
        console.log("------------------END------------------");
    }
});

//#region isValidData
/**
 * 値の検証
 * @param data 
 * @returns 
 */
function isValidData(data: any): string {

    let errorMessage: string = "";

    if (data.email === undefined) {
        errorMessage += "emailがありません。";
    }

    if (data.key === undefined) {
        errorMessage += "keyがありません。";
    }

    if (data.kosu === undefined) {
        errorMessage += "kosuがありません。";
    }

    // 存在しない場合はここまで
    if (errorMessage !== "") {
        return errorMessage;
    }

    if (data.kosu.length === 0) {
        errorMessage += "kosuがありません。";
    }

    data.kosu.forEach((datum: any) => {
        if (datum.date === undefined) {
            errorMessage += "dateがありません。";
        }

        if (datum.task === undefined) {
            errorMessage += "taskがありません。";
        }

        if (datum.hours === undefined) {
            errorMessage += "hoursがありません。";
        }

        // 存在しない場合はここまで
        if (errorMessage !== "") {
            return;
        }

        // 日付チェック
        if (!isValidDate(datum.date)) {
            errorMessage += "dateの値が不正です。";
        }

        // 数値チェック
        if (isNaN(Number(datum.hours))) {
            errorMessage += "hoursの値が不正です。";
        }

    });

    return errorMessage;
}
//#endregion

//#region isValidDate
/**
 * 日付の検証
 * @param value 
 * @returns 
 */
function isValidDate(value: string): boolean {

    // 桁数チェック
    if (value.length !== 8) {
        return false;
    }

    // 数値チェック
    const y: number = Number(value.substring(0, 4));
    const m: number = Number(value.substring(4, 6));
    const d: number = Number(value.substring(6, 8));

    if (isNaN(y)) {
        return false;
    }

    if (isNaN(m)) {
        return false;
    }

    if (isNaN(d)) {
        return false;
    }

    // 日付型チェック（変換後の数字が変換前の数値と同じかチェック）
    const date: Date = new Date(y, m - 1, d);

    if (date.getFullYear() !== y) {
        console.log("年不正", date.getFullYear(), y);
        return false;
    }

    if (date.getMonth() + 1 !== m) {
        console.log("月不正", date.getMonth(), m);
        return false;
    }

    if (date.getDate() !== d) {
        console.log("日不正", date.getDate(), d);
        return false;
    }

    return true;
}
//#endregion

//#region isValidUserKey
/**
 * ユーザーとキーの検証
 * @param email 
 * @param key 
 * @returns 
 */
async function isValidUserKey(email: string, key: string): Promise<boolean> {
    const db = admin.firestore();
    const docs = await db.collection("apikey").where("email", "==", email).where("key", "==", key).get();
    return !docs.empty;
}
//#endregion

//#region convertDailyData
/**
 * POSTされたデータを扱いやすいDailyに変換する
 * @param data 
 * @returns 
 */
function convertDailyData(data: any): Daily[] {
    // let ret: Map<string, Daily> = new Map();

    let ret: Daily[] = [];
    data.kosu.forEach((datum: any) => {

        let tmpJobs: Jobs = {
            job: datum.task,
            hours: datum.hours,
            user: data.email,
            date: datum.date,
            index: 0,
            group_name: datum.group ? datum.group : "",
        }

        let tmpDaily: Daily = {
            jobs: [],
            memo: "",
            total: datum.hours,
            date: datum.date,
        }

        const index: number = ret.findIndex(x => x.date === datum.date);
        if (index > -1) {
            ret[index].jobs.push(tmpJobs);
            ret[index].total += datum.hours;
        } else {
            tmpDaily.jobs.push(tmpJobs);
            ret.push(tmpDaily);
        }

    });

    // indexを設定
    ret.forEach((daily: Daily) => {
        daily.jobs.forEach((job: Jobs, index: number) => {
            job.index = index;
        });
    });

    return ret;
}
//#endregion

//#region insertData
/**
 * データ登録処理
 * @param daily 
 * @param user 
 * @returns 
 */
async function insertData(daily: Daily[], user: string): Promise<boolean> {

    let isSuccess: boolean = true;

    try {

        let refsForDelete: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>[] = [];
        const db = admin.firestore();

        // 削除対象を取得する
        for (let d of daily) {
            const docs = await db.collectionGroup("jobs").where("user", "==", user).where("date", "==", d.date).get();
            docs.forEach(doc => {
                refsForDelete.push(doc.ref);
            });
        }

        // 削除する
        refsForDelete.forEach(ref => {
            db.collection(ref.parent.path).doc(ref.id).delete();
        });

        let months: string[] = [];
        for (let d of daily) {
            const pathDaily = combinePath([user, "daily"]);
            const pathJobs = combinePath([user, "daily", d.date, "jobs"]);

            // 仕事データ作成
            for (let job of d.jobs) {
                await db.collection(pathJobs).add(job);
            }

            // 日次データ更新
            await db.collection(pathDaily).doc(d.date).set({
                memo: d.memo,
                total: d.total,
            });

            const yearMonth = getYearMonth(d.date);
            if (!months.find(x => x === yearMonth)) {
                months.push(yearMonth);
                console.log(yearMonth);
            }
        }
    }
    catch (e) {
        isSuccess = false;
    }
    finally {
        return isSuccess;
    }
}
//#endregion

//#region combinePath
/**
 * コレクションのパスを作成する
 * @param layers 
 * @returns 
 */
function combinePath(layers: string[]): string {
    return '/urdayin/' + layers.join('/') + '/';
}
//#endregion

//#region getYearMonth
/**
 * 年月日から年月を取得する
 * @param date 
 * @returns 
 */
function getYearMonth(date: string): string {
    return date.substring(0, 6);
}
//#endregion