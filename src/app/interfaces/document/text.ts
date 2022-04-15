import { Timestamp } from "firebase/firestore";

export interface Text {
    edition: number,
    text: string,
    create: Timestamp,
}
