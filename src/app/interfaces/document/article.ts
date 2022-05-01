import { Timestamp } from "firebase/firestore";
import { Reaction } from "./reaction";

export interface Article {
    writer: string,
    create_timestamp: Timestamp,
    update_timestamp: Timestamp,
    status: string,
    last_edition: number,
    reactions: Reaction,
    summary_title: string,
    summary_text: string,
}
