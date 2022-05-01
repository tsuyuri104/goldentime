import { Comment } from "../document/comment";

export interface ExComment extends Comment {
    commenter_name: string,
}
