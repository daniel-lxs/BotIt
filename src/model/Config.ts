export interface Config {
  reddit: RedditConfig;
}

export interface RedditConfig {
  baseUrl: string;
  subreddit: string;
  postFilter: {
    minUpvotes?: number;
    maxDownvotes?: number;
    minUpvoteRatio?: number;
    limit?: number;
  };
}
