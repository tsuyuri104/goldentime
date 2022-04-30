import { Timestamp } from "firebase/firestore";

export interface Comment {
    comment: string,
    commenter: string,
    create_timestamp: Timestamp,
    article_id: string,
}
