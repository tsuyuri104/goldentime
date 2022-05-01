import { Timestamp } from "firebase/firestore";
import { ReactionType } from "src/app/types/reaction-type";

export interface Reactioner {
    user: string,
    reaction: ReactionType,
    create_timestamp: Timestamp,
    article_id: string,
}
