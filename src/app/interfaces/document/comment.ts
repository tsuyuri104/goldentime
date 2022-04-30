import { Timestamp } from "firebase/firestore";

export interface Comment {
    comment: string,
    commenter: string,
    create: Timestamp,
}
