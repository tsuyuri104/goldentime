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
        const daily: Map<string, Daily> = convertDailyData(data.data);

        // 登録処理
        if (! await insertData(daily)) {
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

