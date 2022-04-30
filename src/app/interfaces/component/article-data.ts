import { Article } from "../document/article";
import { Comment } from "../document/comment";
import { Edition } from "../document/edition";

export interface ArticleData {
    article?: Article,
    text?: Edition,
    comments?: Comment[],
}
