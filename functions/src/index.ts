import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase)

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


export const SetDailyData = functions.https.onCall(async (data, context) => {
    //onCallなのでPOSTでくる
});

