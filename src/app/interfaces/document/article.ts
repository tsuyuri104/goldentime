import { Timestamp } from "firebase/firestore";

export interface Article {
    writer: string,
    create_timestamp: Timestamp,
    update_timestamp: Timestamp,
    status: string,
    last_edition: number,
    reactions: string[],
    summary_title: string,
    summary_text: string,
}
