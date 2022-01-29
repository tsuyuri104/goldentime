import { Timestamp } from "firebase/firestore";

export interface Notice {
    version: string,
    date: Timestamp,
    detail: string[],
}
