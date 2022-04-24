import { Timestamp } from "firebase/firestore";

export interface ArticleList {
    id: string,
    title: string,
    text: string,
    writer: string,
    user_name: string,
    update_timestamp: Timestamp,
}
