export interface ArticleListConfig {
  type: "all" | "feed";

  filters: {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
  };
}
