import { Timestamp } from "firebase/firestore";
import { Reaction } from "../document/reaction";

export interface ArticleList {
    id: string,
    title: string,
    text: string,
    writer: string,
    user_name: string,
    update_timestamp: Timestamp,
    reactions: Reaction,
    comments: number,
}
