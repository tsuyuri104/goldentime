import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { initializeApp, getApp } from "firebase/app";

const firebaseConfig = {
};

initializeApp(firebaseConfig.firebase);
const functions = getFunctions(getApp());
connectFunctionsEmulator(functions, "localhost", 5001);

const main = async () => {


}

main();