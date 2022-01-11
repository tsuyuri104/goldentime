import { Timestamp } from "firebase/firestore";


export interface Notices {
    date: Timestamp,
    detail: string[],
}
