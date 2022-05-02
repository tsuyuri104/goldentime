//WhereやOrderで使用しているフィールドのみ
export class ArticleFiledName {
    // 共通 
    public static readonly ARTICLE_ID: string = "article_id";

    // 記事専用
    public static readonly WRITER: string = "writer";
    public static readonly STATUS: string = "status";

    // エディション専用
    public static readonly EDITION: string = "edition";

    // コメント専用

    // リアクション専用
    public static readonly USER: string = "user";
}
