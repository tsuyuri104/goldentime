import { Timestamp } from "firebase/firestore";

export interface Edition {
    edition: number,
    text: string,
    create: Timestamp,
}
