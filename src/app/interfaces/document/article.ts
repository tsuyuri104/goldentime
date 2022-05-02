import { Timestamp } from "firebase/firestore";
import { ArticleStatus } from "src/app/types/article-status";
import { Reaction } from "./reaction";

export interface Article {
    writer: string,
    create_timestamp: Timestamp,
    update_timestamp: Timestamp,
    status: ArticleStatus,
    last_edition: number,
    reactions: Reaction,
    summary_title: string,
    summary_text: string,
    comment_volume: number,
}
