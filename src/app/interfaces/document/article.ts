import { Timestamp } from "firebase/firestore";

export interface Article {
    writer: string,
    create: Timestamp,
    update: Timestamp,
    status: string,
    last_edition: number,
    reactions: string[],
}
