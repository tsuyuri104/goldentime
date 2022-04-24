import { Timestamp } from "firebase/firestore";

export interface Edition {
    edition: number,
    title: string,
    text: string,
    create: Timestamp,
}
