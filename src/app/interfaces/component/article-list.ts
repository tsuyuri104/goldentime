import { Timestamp } from "firebase/firestore";
import { ArticleStatus } from "src/app/types/article-status";
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
    status: ArticleStatus,
    isMine: boolean,
}
