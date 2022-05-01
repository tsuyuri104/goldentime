import { ExArticle } from "./ex-article";
import { ExComment } from "./ex-comment";
import { ExEdition } from "./ex-edition";

export interface ArticleData {
    article?: ExArticle,
    text?: ExEdition,
    comments?: ExComment[],
}